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
import tls from "node:tls";

// Configure default ECDH curve to prime256v1 to bypass ESET SSL/TLS protocol filtering
// issues with post-quantum ciphers/curves (such as Kyber X25519Kyber768Draft00)
tls.DEFAULT_ECDH_CURVE = "prime256v1";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "tesserae";

class MockCollection {
  name: string;
  data: any[] = [];

  constructor(name: string) {
    this.name = name;
  }

  async findOne(query: any) {
    const item = this.data.find(item => this.match(item, query));
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async insertOne(doc: any) {
    const newDoc = JSON.parse(JSON.stringify(doc));
    if (!newDoc._id && !newDoc.id) {
      newDoc._id = Math.random().toString(36).substring(2);
    }
    this.data.push(newDoc);
    return { acknowledged: true, insertedId: newDoc._id || newDoc.id };
  }

  async updateOne(query: any, update: any, options?: any) {
    const item = this.data.find(item => this.match(item, query));
    if (item) {
      const set = update.$set || update;
      Object.assign(item, JSON.parse(JSON.stringify(set)));
      return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    }
    if (options?.upsert) {
      const set = update.$set || update;
      const newDoc = { ...query, ...JSON.parse(JSON.stringify(set)) };
      if (!newDoc._id && !newDoc.id) {
        newDoc._id = Math.random().toString(36).substring(2);
      }
      this.data.push(newDoc);
      return { acknowledged: true, matchedCount: 0, modifiedCount: 0, upsertedId: newDoc._id || newDoc.id };
    }
    return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
  }

  async deleteOne(query: any) {
    const index = this.data.findIndex(item => this.match(item, query));
    if (index !== -1) {
      this.data.splice(index, 1);
      return { acknowledged: true, deletedCount: 1 };
    }
    return { acknowledged: true, deletedCount: 0 };
  }

  async deleteMany(query: any) {
    const initialLength = this.data.length;
    this.data = this.data.filter(item => !this.match(item, query));
    return { acknowledged: true, deletedCount: initialLength - this.data.length };
  }

  find(query: any) {
    const filtered = this.data.filter(item => this.match(item, query));
    const results = JSON.parse(JSON.stringify(filtered));
    return {
      toArray: async () => results,
      limit: function() { return this; },
      sort: function() { return this; }
    };
  }

  async createIndex() {
    return "mock-index";
  }

  async dropIndex() {
    return true;
  }

  private match(item: any, query: any): boolean {
    for (const key in query) {
      const queryVal = query[key];
      const itemVal = item[key];
      if (typeof queryVal === 'object' && queryVal !== null) {
        if ('$in' in queryVal) {
          if (!Array.isArray(queryVal.$in) || !queryVal.$in.includes(itemVal)) {
            return false;
          }
        } else {
          if (JSON.stringify(itemVal) !== JSON.stringify(queryVal)) {
            return false;
          }
        }
      } else {
        if (itemVal !== queryVal) {
          return false;
        }
      }
    }
    return true;
  }
}

class MockDb {
  collections: Record<string, MockCollection> = {};

  collection(name: string) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name);
    }
    return this.collections[name];
  }
}

// Cache the connection across hot-reloads in development
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mockDb: MockDb | undefined;
}

async function getDb(): Promise<Db> {
  if (!MONGODB_URI) {
    console.warn("[AI Studio] MONGODB_URI is not set. Falling back to in-memory MockDb.");
    if (!global._mockDb) {
      global._mockDb = new MockDb();
    }
    return global._mockDb as unknown as Db;
  }

  try {
    let client: MongoClient;
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        global._mongoClientPromise = new MongoClient(MONGODB_URI, {
          // Fail fast instead of the driver's 30s default: a hanging auth
          // request is aborted client-side and surfaces only as the generic
          // "Failed to fetch" TypeError. A fast failure returns parseable JSON.
          serverSelectionTimeoutMS: 4000,
        }).connect();
        // A rejected promise must not stay cached: otherwise a transient DB
        // outage permanently breaks auth until the dev server restarts.
        // Reset on failure so the next request retries the connection.
        global._mongoClientPromise.catch(() => {
          global._mongoClientPromise = undefined;
        });
      }
      client = await global._mongoClientPromise;
    } else {
      client = await new MongoClient(MONGODB_URI, {
        // Same fail-fast rationale as the development branch above.
        serverSelectionTimeoutMS: 4000,
      }).connect();
    }

    return client.db(MONGODB_DB_NAME);
  } catch (error) {
    console.warn("[AI Studio] Failed to connect to MongoDB. Falling back to in-memory MockDb.", error);
    if (!global._mockDb) {
      global._mockDb = new MockDb();
    }
    return global._mockDb as unknown as Db;
  }
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
if (process.env.NODE_ENV === "development") {
  // During local development, force the base URL to localhost:3000 so the
  // redirect URI generated for Google is exactly http://localhost:3000/api/auth/callback/google
  betterAuthUrl = "http://localhost:3000";
} else if (rawAuthUrl) {
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
  "https://*.run.app",
  "https://*.asia-east1.run.app",
  "https://*.us-central1.run.app",
  "https://*.europe-west1.run.app",
  "https://*.vercel.app",
  "https://*.gitpod.io",
  "https://*.github.dev",
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
    advanced: {
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
