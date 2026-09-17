// TEMP DIAG 2 — variant matrix to isolate the alert-80 source.
// Same OpenSSL stack as the MongoDB driver (Node tls module).
// Read-only: opens TCP+TLS, prints the failure/success per variant, exits.
import tls from "node:tls";
import dns from "node:dns/promises";

const CLUSTER = "cluster0.kdl1dya.mongodb.net";
const DIRECT_IP = "159.41.192.43";

async function shards() {
  const out = [];
  try {
    const recs = await dns.resolveSrv("_mongodb._tcp." + CLUSTER);
    for (const r of recs.sort((a, b) => a.name.localeCompare(b.name))) out.push(r.name);
  } catch (e) {
    out.push("ac-wxcosqs-shard-00-00." + CLUSTER);
  }
  return out;
}

function attempt(label, opts) {
  return new Promise((resolve) => {
    const started = Date.now();
    let sawCert = false;
    const socket = tls.connect(opts, () => {
      const c = socket.getPeerCertificate();
      console.log(
        label + " => OK tls=" + socket.getProtocol() +
        " certIssuer=" + JSON.stringify(c.issuer ?? {}).slice(0, 90)
      );
      socket.destroy();
      resolve();
    });
    socket.setTimeout(10000);
    socket.on("peerCertificate", () => { sawCert = true; });
    socket.on("data", () => {});
    socket.on("error", (e) => {
      console.log(
        label + " => FAIL tls=" + (socket.getProtocol() || "-") +
        " certArrived=" + (sawCert ? "yes" : "no") +
        " ms=" + (Date.now() - started) +
        "\n        " + String(e.message).split("\n")[0].replace(/\s+/g, " ").trim()
      );
      resolve();
    });
    socket.on("timeout", () => {
      console.log(label + " => TIMEOUT ms=" + (Date.now() - started));
      socket.destroy();
      resolve();
    });
  });
}

// Baseline: does Node's OpenSSL do TLS at all on this machine?
await attempt("control github.com:443 TLS1.3", {
  host: "github.com", port: 443, servername: "github.com", rejectUnauthorized: false,
});

const hosts = await shards();
for (const h of hosts) {
  await attempt("atlas " + h + ":27017 default", {
    host: h, port: 27017, servername: h, rejectUnauthorized: false,
  });
  await attempt("atlas " + h + ":27017 forcedTLS1.2", {
    host: h, port: 27017, servername: h, rejectUnauthorized: false,
    minVersion: "TLSv1.2", maxVersion: "TLSv1.2",
  });
  await attempt("atlas " + h + ":27017 forcedTLS1.3", {
    host: h, port: 27017, servername: h, rejectUnauthorized: false,
    minVersion: "TLSv1.3", maxVersion: "TLSv1.3",
  });
  await attempt("atlas " + h + ":27017 noSNI", {
    host: h, port: 27017, rejectUnauthorized: false,
  });
}

// Same endpoint via raw IP (stale-shard / DNS discriminator).
await attempt("atlas IP " + DIRECT_IP + ":27017 staticSNI", {
  host: DIRECT_IP, port: 27017, servername: hosts[0], rejectUnauthorized: false,
});

console.log("PROBE2_DONE");
