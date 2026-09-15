import { MongoClient } from "mongodb";
import * as fs from "node:fs";
import * as path from "node:path";
import * as tls from "node:tls";
import * as crypto from "node:crypto";

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const projectRoot = path.resolve(import.meta.dirname);
const envVars = parseEnvFile(path.join(projectRoot, ".env.local"));
const uri = envVars.MONGODB_URI;

if (!uri) { console.log("MONGODB_URI not set"); process.exit(1); }

// 1. Check ESET SSL Filter CA in cert stores
console.log("=== ESET Certificates in Windows Stores ===");
const storeResults = [];
["ROOT", "CA", "MY"].forEach(store => {
  try {
    const certs = crypto.getCerts(store) || [];
    const eset = certs.filter(c => (c.subjectName || c.subject || "").toString().match(/ESET/i));
    storeResults.push({ store, esetCount: eset.length, total: certs.length });
    if (eset.length) {
      console.log(`  ${store}: ${eset.length} ESET cert(s) found`);
      eset.forEach(c => console.log(`    - ${c.subjectName || c.subject || "?"}`));
    }
  } catch (err) {
    storeResults.push({ store, error: err.message });
  }
});

const esetRootCA = storeResults.find(r => r.store === "ROOT" && r.esetCount > 0);
console.log("");
console.log("ESET SSL Filter CA in ROOT:", esetRootCA ? "PRESENT" : "NOT FOUND");

// 2. Inspect TLS certificate from Atlas shard
console.log("");
console.log("=== TLS Certificate Inspection ===");
const tlsSocket = tls.connect({
  host: "159.41.192.43",
  port: 27017,
  servername: "ac-wxcosqs-shard-00-00.kdl1dya.mongodb.net",
  rejectUnauthorized: false,
  timeout: 10000,
});

tlsSocket.on("secureConnect", () => {
  const cert = tlsSocket.getPeerCertificate(true);
  const subject = (cert.subjectName || cert.subject || "").toString();
  const issuer = (cert.issuerName || cert.issuer || "").toString();
  console.log("Server certificate issuer:", issuer.slice(0, 120));
  console.log("ESET-issued:", issuer.match(/ESET/i) ? "YES — ESET interception confirmed" : "NO");
  console.log("Legitimate Atlas CA:", issuer.match(/Amazon|R3|DigiCert|GTE|Cloudflare/i) ? "YES" : "NO");
  
  const isEset = issuer.match(/ESET/i);
  tlsSocket.end();
  
  console.log("");
  if (isEset) {
    console.log("=== ROOT CAUSE ===");
    console.log("ESET SSL/TLS filtering is intercepting the MongoDB Atlas TLS connection.");
    console.log("The server presents an ESET-signed certificate instead of the real Atlas certificate.");
    console.log("The MongoDB driver correctly rejects this as a TLS interception.");
    console.log("");
    console.log("Fix: Exclude node.exe from ESET SSL/TLS inspection:");
    console.log("  ESET Internet Security → Advanced setup (F5) → Protection → SSL/TLS → Excluded applications → Add");
    console.log("  Path: C:\\Program Files\\nodejs\\node.exe");
  } else {
    console.log("Certificate is NOT ESET-issued. Investigating other causes...");
  }
});

tlsSocket.on("error", err => {
  console.log("TLS error:", err.code || err.message.split("\n")[0]);
  console.log("Unable to inspect certificate — TLS connection failed before cert exchange.");
});
