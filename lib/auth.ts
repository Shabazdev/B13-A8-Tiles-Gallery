/**
 * Better Auth — Server Instance
 * Replaces Firebase Authentication entirely.
 *
 * Database: MongoDB (via @better-auth/mongo-adapter).
 * Connection is cached across hot-reloads in dev to avoid exhausting connections.
 */

import { MongoClient, Db } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "tesserae";

// Cache the connection across hot-reloads in development
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function getDb(): Promise<Db> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Please add it to your .env.local file."
    );
  }

  let client: MongoClient;
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(MONGODB_URI).connect();
    }
    client = await global._mongoClientPromise;
  } else {
    client = await new MongoClient(MONGODB_URI).connect();
  }

  return client.db(MONGODB_DB_NAME);
}

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

// Normalize BETTER_AUTH_URL — trim whitespace, parse with URL() to strip
// trailing slashes / paths, and fall back to localhost for development.
// This prevents "Invalid origin" errors caused by malformed env values
// (e.g. trailing space, trailing slash, or protocol-relative URLs).
const rawAuthUrl = process.env.BETTER_AUTH_URL?.trim() ?? "";
let betterAuthUrl: string;
if (rawAuthUrl) {
  try {
    betterAuthUrl = new URL(rawAuthUrl).origin;
  } catch {
    betterAuthUrl = "http://localhost:3000";
  }
} else {
  betterAuthUrl = "http://localhost:3000";
}

// Build the list of trusted origins.
// Always include the configured URL and localhost so both prod and dev work.
const trustedOrigins: string[] = [
  betterAuthUrl,
  "http://localhost:3000",
];

// When deployed on Vercel, VERCEL_URL is automatically set to the deployment
// domain (e.g. "b13-a8-tiles-gallery-pi.vercel.app"). Add it as a trusted
// origin so requests from the actual deployment URL pass origin validation
// even if BETTER_AUTH_URL was not explicitly configured.
if (process.env.VERCEL_URL) {
  const vercelOrigin = `https://${process.env.VERCEL_URL}`;
  if (!trustedOrigins.includes(vercelOrigin)) {
    trustedOrigins.push(vercelOrigin);
  }
}

// Create the auth instance with MongoDB adapter
const createAuth = async () => {
  const db = await getDb();

  return betterAuth({
    baseURL: betterAuthUrl,
    database: mongodbAdapter(db, {
      usePlural: false,
    }),
    trustedOrigins,
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
