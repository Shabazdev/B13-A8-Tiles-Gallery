// TEMP DIAG — is the Atlas handshake aborted by an ESET interception layer, or
// by the remote endpoint itself?
//
// Rewritten because the previous version called `crypto.getCerts(store)`, which
// is not a Node API (it is always `undefined`). Every store fell into the catch
// branch, so the script reported "ESET SSL Filter CA in ROOT: NOT FOUND" while
// the ESET root CA *was* installed — a false negative that pointed the
// investigation at the wrong layer.
//
// Node cannot read the Windows certificate stores, so they are enumerated
// through PowerShell's Cert: provider as JSON.
import * as fs from "node:fs";
import * as path from "node:path";
import * as tls from "node:tls";
import * as dns from "node:dns/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const PS_STORES = ["LocalMachine\\Root", "LocalMachine\\CA", "CurrentUser\\Root"];
const PORT = 27017;

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

const jsonEncode = (value) =>
  JSON.stringify(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ");

// ---------------------------------------------------------------------------
// Context: cluster host taken from the URI without echoing credentials.
// ---------------------------------------------------------------------------
const projectRoot = path.resolve(import.meta.dirname);
const uri = parseEnvFile(path.join(projectRoot, ".env.local")).MONGODB_URI;
if (!uri) { console.log("MONGODB_URI not set in .env.local"); process.exit(1); }

const clusterHost = (/mongodb(\+srv)?:\/\/[^@\s]*@([^/?,]+)/i.exec(uri)?.[2] ?? "").trim();
if (!clusterHost) { console.log("Could not parse a cluster host out of MONGODB_URI"); process.exit(1); }
console.log("CLUSTER_HOST=" + clusterHost);

// ---------------------------------------------------------------------------
// 1. Is the ESET SSL Filter CA installed? ("filtering enabled" — nothing more)
// ---------------------------------------------------------------------------
console.log("");
console.log("=== ESET certificates in the Windows stores ===");
const psScript = "$out = @();" +
  "foreach ($s in @(" + PS_STORES.map((s) => "'" + s + "'").join(",") + ")) {" +
  "  $p = 'Cert:\\' + $s;" +
  "  $out += @(Get-ChildItem -Path $p -ErrorAction SilentlyContinue |" +
  "    Where-Object { $_.Subject -match 'ESET' -or $_.Issuer -match 'ESET' } |" +
  "    ForEach-Object { [pscustomobject]@{ store = $s; subject = $_.Subject; thumbprint = $_.Thumbprint; notAfter = $_.NotAfter.ToString('o') } });" +
  "}" +
  "if (@($out).Count -eq 0) { '[]' } else { ConvertTo-Json -InputObject @($out) -Compress }";

let esetCerts = [];
try {
  const { stdout } = await run("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", psScript], { timeout: 30000 });
  esetCerts = [].concat(JSON.parse(stdout.trim() || "[]"));
} catch (err) {
  console.log("  ! Could not enumerate the certificate stores: " + String(err.message).split("\n")[0]);
}
for (const cert of esetCerts) {
  console.log("  " + cert.store + ": " + cert.subject);
  console.log("     thumbprint " + cert.thumbprint + "  expires " + cert.notAfter);
}
console.log("ESET SSL Filter CA installed:", esetCerts.length ? "YES (" + esetCerts.length + ")" : "NO");
console.log("An installed filter CA means SSL/TLS filtering is ON. It is NOT proof that");
console.log("interception caused a handshake alert: interception shows up as a peer");
console.log("certificate issued by ESET, or as a validation error such as");
console.log("UNABLE_TO_VERIFY_LEAF_SIGNATURE / SELF_SIGNED_CERT_IN_CHAIN.");

// ---------------------------------------------------------------------------
// 2. One real TLS handshake, classified by the stage at which it stops.
// ---------------------------------------------------------------------------
async function resolveShard(cluster) {
  try {
    const recs = await dns.resolveSrv("_mongodb._tcp." + cluster);
    const sorted = recs.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
    if (sorted[0]?.name) return sorted[0].name;
  } catch { /* fall through: the caller reports the failure */ }
  return null;
}

function handshake(host) {
  return new Promise((resolve) => {
    const started = Date.now();
    let certArrived = false;
    const socket = tls.connect({ host, port: PORT, servername: host, rejectUnauthorized: false });
    socket.setTimeout(12000);
    socket.on("peerCertificate", () => { certArrived = true; });
    socket.on("data", () => { /* drain bytes that can precede an abort */ });
    socket.on("secureConnect", () => {
      const cert = socket.getPeerCertificate(true);
      resolve({
        ok: true, certArrived, ms: Date.now() - started, protocol: socket.getProtocol(),
        issuer: cert.issuer ?? {}, subject: cert.subject ?? "",
      });
      socket.destroy();
    });
    socket.on("error", (err) => resolve({
      ok: false, certArrived, ms: Date.now() - started,
      code: err.code ?? "", message: String(err.message).split("\n")[0].replace(/\s+/g, " ").trim(),
    }));
    socket.on("timeout", () => {
      resolve({ ok: false, certArrived, timeout: true, ms: Date.now() - started });
      socket.destroy();
    });
  });
}

console.log("");
console.log("=== TLS handshake to a live shard ===");
const shard = await resolveShard(clusterHost);
if (!shard) {
  console.log("SRV lookup for _mongodb._tcp." + clusterHost + " failed — no shard to probe.");
  process.exit(0);
}
console.log("TARGET=" + shard + ":" + PORT);

const result = await handshake(shard);
const issuer = jsonEncode(result.issuer ?? {});
const detail = result.code + " " + result.message;
const isAlert80 = /alert internal error|alert number 80|ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR/i.test(detail);
const trustFailure = /UNABLE_TO_VERIFY|SELF_SIGNED|CERT_UNTRUSTED|CERT_HAS_EXPIRED/i.test(detail);
const esetSigned = /ESET/i.test(issuer);

if (result.ok) {
  console.log("HANDSHAKE=COMPLETED protocol=" + result.protocol + " ms=" + result.ms);
  console.log("PEER_SUBJECT=" + jsonEncode(result.subject));
  console.log("PEER_ISSUER=" + issuer);
  console.log("ISSUED_BY_ESET=" + (esetSigned ? "YES" : "NO"));
  if (esetSigned) {
    console.log("=== ESET INTERCEPTION CONFIRMED ===");
    console.log("The peer certificate is ESET-issued: ESET terminates TLS and re-originates");
    console.log("the connection to Atlas.");
    console.log("Fix: ESET Internet Security -> Advanced setup (F5) -> Protection -> SSL/TLS ->");
    console.log("     Excluded applications -> Add -> C:\\Program Files\\nodejs\\node.exe");
  } else {
    console.log("Certificate is not ESET-issued: no interception on this connection.");
  }
} else if (result.timeout) {
  console.log("HANDSHAKE=TIMEOUT after " + result.ms + "ms certArrived=" + result.certArrived);
  console.log("A timeout points at packet loss / firewall drops, not at a TLS alert.");
} else {
  console.log("HANDSHAKE=FAILED ms=" + result.ms + " certArrived=" + result.certArrived);
  console.log("CODE=" + result.code);
  console.log("MSG=" + result.message);
  if (isAlert80 && !result.certArrived) {
    console.log("=== REMOTE ENDPOINT ABORTED THE HANDSHAKE ===");
    console.log("Alert 80 arrived before any certificate, so this is a peer-sent alert, not a");
    console.log("local trust failure. Interception presents its own certificate and therefore");
    console.log("fails only after certArrived=yes. Check, in this order:");
    console.log("  1. Atlas: is the cluster running (not paused/terminated), and does the");
    console.log("     connection string belong to the current cluster?");
    console.log("  2. Atlas: does Network Access allow this public IP?");
    console.log("  3. Re-run from another network (phone hotspot) to rule out the path.");
  } else if (esetSigned) {
    console.log("=== ESET INTERCEPTION CONFIRMED (peer certificate is ESET-issued) ===");
    console.log("Fix: exclude C:\\Program Files\\nodejs\\node.exe in ESET's SSL/TLS settings.");
  } else if (trustFailure) {
    console.log("=== CERTIFICATE TRUST FAILURE ===");
    console.log("A validation error while a certificate was present: either an interception CA");
    console.log("that Node does not trust, or a genuinely invalid chain.");
  }
}
console.log("ESET_CERT_CHECK_DONE");
