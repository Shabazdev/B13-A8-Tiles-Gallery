// TEMP DIAG - Step 2 direct MongoDB test (no app code). Prints no secrets.
import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME ?? "tesserae";
const safe = (m) => String(m)
  .replace(/mongodb(\+srv)?:\/\/[^@\s]*@/gi, "mongodb+srv://***:***@")
  .replace(/\/\/[^:@\/\s]+:[^@\/\s]+@/g, "//***:***@")
  .replace(/\s+/g, " ").trim();
if (!uri) { console.log("MONGODB_CONNECTION_FAILED: MONGODB_URI is not set"); process.exit(0); }
const t = Date.now();
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  await client.db(dbName).command({ ping: 1 });
  console.log("MONGODB_CONNECTION_SUCCESS (" + (Date.now() - t) + "ms)");
} catch (e) {
  console.log("MONGODB_CONNECTION_FAILED (" + (Date.now() - t) + "ms): " + safe(e.message));
} finally {
  await client.close().catch(() => {});
}
