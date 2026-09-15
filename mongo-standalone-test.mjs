import { MongoClient } from "mongodb";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

// Parse .env.local manually (no dotenv dependency needed)
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const projectRoot = path.resolve(import.meta.dirname);
const envPath = path.join(projectRoot, ".env.local");

const envVars = fs.existsSync(envPath) ? parseEnvFile(envPath) : {};
const uri = envVars.MONGODB_URI;
const dbName = envVars.MONGODB_DB_NAME || "tesserae";

if (!uri) {
  console.log("MONGODB_URI not set in .env.local");
  process.exit(1);
}

// Strip credentials for any logging
function safeUri(u) {
  try {
    const parsed = new URL(u);
    const user = parsed.username ? "[USER]" : "";
    const pass = parsed.password ? "[PASSWORD]" : "";
    const host = parsed.hostname;
    const port = parsed.port || "27017";
    const path = parsed.pathname || "";
    return `mongodb://${user}:${pass}@${host}:${port}${path}`;
  } catch {
    return "[REDACTED]";
  }
}

// Extract Atlas host for logging
function extractHost(u) {
  try {
    const parsed = new URL(u);
    return parsed.hostname;
  } catch {
    return "unknown";
  }
}

console.log("=== MongoDB Standalone Connection Test ===");
console.log("Node:", process.version);
console.log("OpenSSL:", process.versions.openssl);
console.log("Atlas host:", extractHost(uri));
console.log("Target:", safeUri(uri));
console.log("Database:", dbName);

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
});

try {
  console.log("Connecting...");
  const connectStart = Date.now();
  await client.connect();
  console.log("Connected in", Date.now() - connectStart, "ms");
  console.log("Running ping...");
  const pingStart = Date.now();
  await client.db("admin").command({ ping: 1 });
  console.log("Ping completed in", Date.now() - pingStart, "ms");
  console.log("MONGODB_CONNECTION_SUCCESS");
  await client.close();
  console.log("Connection closed.");
  process.exit(0);
} catch (err) {
  console.log("FAIL_CATEGORY:", err.code || "NO_CODE");
  console.log("FAIL_MESSAGE:", err.message.split("\n")[0]);
  if (err.systemError) {
    console.log("SYSTEM_ERROR_CODE:", err.systemError);
  }
  // Extract error labels if present
  if (err.hasErrorLabel) {
    console.log("ERROR_LABELS:", [...err.hasErrorLabel ? err.errorLabels || [] : []]);
  }
  process.exit(1);
}
