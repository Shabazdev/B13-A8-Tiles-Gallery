/**
 * Better Auth — Server Instance
 * Replaces Firebase Authentication entirely.
 *
 * Database: MongoDB (via @better-auth/mongo-adapter).
 *
 * The MongoClient is cached for the lifetime of the process — in development
 * *and* in production. The production branch used to build a brand new
 * MongoClient per request and never close it, which leaks a connection pool on
 * every auth call and eventually exhausts the cluster's connection limit.
 */

import { MongoClient, Db } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const MONGODB_DB_NAME = (process.env.MONGODB_DB_NAME ?? "tesserae").trim();

/**
 * Configuration is validated up front and reported explicitly.
 *
 * Both of these previously failed *silently*, and both produce the same
 * useless symptom in the browser ("An unexpected error occurred. Please try
 * again.") because the client has no `code`/`message` to read:
 *
 *  1. A missing MONGODB_URI used to fall back to an in-memory fake database.
 *     Registration looked like it worked, but every user and session was
 *     discarded when the process ended (on Vercel: immediately), and once
 *     Better Auth touched a Mongo method the fake did not implement it crashed
 *     with an empty-bodied 500.
 *  2. A missing BETTER_AUTH_SECRET makes Better Auth generate a random secret
 *     per process, so every session cookie becomes unverifiable on the next
 *     request / cold start — users are signed out at random.
 *
 * Throwing here lets app/api/auth/[...all]/route.ts answer with parseable
 * JSON that names the exact variable to fix.
 */
function assertConfig(): void {
  const problems: string[] = [];
  if (!MONGODB_URI) problems.push("MONGODB_URI");
  if (!process.env.BETTER_AUTH_SECRET?.trim()) problems.push("BETTER_AUTH_SECRET");

  if (problems.length > 0) {
    throw new Error(
      `Authentication is not configured: ${problems.join(" and ")} ${
        problems.length > 1 ? "are" : "is"
      } missing on the server. Set ${
        problems.length > 1 ? "them" : "it"
      } in the deployment's environment variables (e.g. Vercel → Project → Settings → Environment Variables) and redeploy.`
    );
  }
}

// Cache the connection across hot-reloads and across requests in one runtime.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function getDb(): Promise<Db> {
  assertConfig();

  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI as string, {
      // Fail fast instead of the driver's 30s default: a hanging auth request
      // is aborted client-side and surfaces only as the generic
      // "Failed to fetch" TypeError. A fast failure returns parseable JSON.
      serverSelectionTimeoutMS: 8000,
    });
    const promise = client.connect();
    // A rejected promise must not stay cached: otherwise a transient DB
    // outage permanently breaks auth until the process restarts.
    // Reset on failure so the next request retries the connection.
    promise.catch(() => {
      global._mongoClientPromise = undefined;
    });
    global._mongoClientPromise = promise;
  }

  const client = await global._mongoClientPromise;
  return client.db(MONGODB_DB_NAME);
}

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

// Normalize BETTER_AUTH_URL — trim whitespace, parse with URL() to strip
// trailing slashes / paths. This prevents "Invalid origin" errors caused by
// malformed env values (trailing space, trailing slash, protocol-relative).
const rawAuthUrl = process.env.BETTER_AUTH_URL?.trim() ?? "";
let betterAuthUrl = "";
if (rawAuthUrl) {
  try {
    betterAuthUrl = new URL(rawAuthUrl).origin;
  } catch {
    betterAuthUrl = "";
  }
}
if (!betterAuthUrl) {
  // Never silently fall back to localhost outside development: a localhost
  // base URL makes Better Auth drop the Secure flag from its cookies and tells
  // Google to redirect to http://localhost:3000/api/auth/callback/google.
  const vercelUrl = process.env.VERCEL_URL?.trim();
  betterAuthUrl = vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";
}

// Origins allowed to call the auth API. An explicit list is deliberate: the
// previous "https://*.vercel.app" wildcard trusted every Vercel-hosted site,
// which defeats origin validation.
const trustedOrigins: string[] = [
  betterAuthUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// When deployed on Vercel, VERCEL_URL is the deployment domain (e.g.
// "b13-a8-tiles-gallery-pi.vercel.app"). Trust it too so preview deployments
// work even when BETTER_AUTH_URL points at the production domain.
if (process.env.VERCEL_URL) {
  const vercelOrigin = `https://${process.env.VERCEL_URL}`;
  if (!trustedOrigins.includes(vercelOrigin)) {
    trustedOrigins.push(vercelOrigin);
  }
}

// Create the auth instance with the MongoDB adapter.
const createAuth = async () => {
  const db = await getDb();

  return betterAuth({
    // Session cookies are signed with this secret. Without an explicit value
    // Better Auth generates a random per-process secret, so sessions issued by
    // one instance (or before a restart) cannot be verified by the next one.
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: betterAuthUrl,
    database: mongodbAdapter(db, {
      // Keeps the collection names in the singular (user, session, account,
      // verification) — the shape the existing data was written with.
      usePlural: false,
    }),
    trustedOrigins,
    advanced: {
      // Behind Vercel's proxy the request host/protocol arrive in the
      // x-forwarded-* headers; trusting them is what makes the generated
      // redirect URIs and cookie flags match the public URL.
      trustedProxyHeaders: true,
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    socialProviders: googleConfigured
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : {},
  });
};

// Cache the auth instance
let authInstance: Awaited<ReturnType<typeof createAuth>> | null = null;

async function initAuth() {
  if (!authInstance) {
    authInstance = await createAuth();
  }
  return authInstance;
}

// Export async getter for the auth instance
// Use this in route handlers and server components
export async function getAuth() {
  return initAuth();
}

// Type exports
export type AuthInstance = Awaited<ReturnType<typeof createAuth>>;
export type Session = AuthInstance["$Infer"]["Session"];
