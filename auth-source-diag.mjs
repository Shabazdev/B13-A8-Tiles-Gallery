// TEMP DIAG — tries the same credentials against different authSource values.
// Prints only outcomes, never the credentials.
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

const uri = parseEnvFile(".env.local").MONGODB_URI;
const user = decodeURIComponent(/:\/\/([^:]+):/.exec(uri)?.[1] ?? "");
console.log("DB username present:", Boolean(user), `(length ${user.length})`);

for (const source of ["admin", "TilesGallery", "tesserae"]) {
  const u = uri.includes("?") ? `${uri}&authSource=${source}` : `${uri}?authSource=${source}`;
  const client = new MongoClient(u, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(`authSource=${source}: SUCCESS`);
  } catch (e) {
    const msg = String(e.message).split("\n")[0].replace(/mongodb(\+srv)?:\/\/\S+/gi, "[redacted]");
    console.log(`authSource=${source}: FAIL — ${msg}`);
  } finally {
    await client.close().catch(() => {});
  }
}
