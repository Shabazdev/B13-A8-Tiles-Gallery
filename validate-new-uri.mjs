// TEMP DIAG — validates the NEW MONGODB_URI from mongodb-new.txt (never prints it).
import { MongoClient } from "mongodb";
import * as fs from "node:fs";

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const uri = parseEnvFile("mongodb-new.txt").MONGODB_URI;
if (!uri) { console.log("MONGODB_URI missing from mongodb-new.txt"); process.exit(1); }
const host = /@([^/?]+)/.exec(uri)?.[1] ?? "unparsable";
const db = (parseEnvFile(".env.local").MONGODB_DB_NAME) || "TilesGallery";
console.log("Validating new URI against host:", host, "db:", db);
const t = Date.now();
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  await client.db(db).command({ ping: 1 });
  console.log(`MONGODB_CONNECTION_SUCCESS (${Date.now() - t}ms) — new credentials are valid`);
} catch (e) {
  const msg = String(e.message).split("\n")[0].replace(/mongodb(\+srv)?:\/\/\S+/gi, "[redacted]");
  console.log(`MONGODB_CONNECTION_FAILED (${Date.now() - t}ms): ${msg}`);
} finally {
  await client.close().catch(() => {});
}
