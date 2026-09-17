/**
 * Shared MongoDB accessor for server-side code (API routes, server actions).
 * Reuses the same MONGODB_URI / MONGODB_DB_NAME as Better Auth so orders land
 * in the same database the users and sessions live in.
 */

import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const MONGODB_DB_NAME = (process.env.MONGODB_DB_NAME ?? "tesserae").trim();

declare global {
  // eslint-disable-next-line no-var
  var _appDbPromise: Promise<Db> | undefined;
}

function assertDbConfig(): void {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing on the server. Set it in the deployment's environment variables and redeploy."
    );
  }
}

async function connectDb(): Promise<Db> {
  assertDbConfig();
  const client = new MongoClient(MONGODB_URI as string, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });
  await client.connect();
  console.log(`[db] Connected to database "${MONGODB_DB_NAME}".`);
  return client.db(MONGODB_DB_NAME);
}

/** Get the shared Db handle (cached for the lifetime of the process). */
export async function getAppDb(): Promise<Db> {
  if (!global._appDbPromise) {
    global._appDbPromise = connectDb().catch((error) => {
      global._appDbPromise = undefined;
      throw error;
    });
  }
  return global._appDbPromise;
}
