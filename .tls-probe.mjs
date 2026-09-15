// TEMP DIAG — TLS handshake transcript to Atlas shard (same OpenSSL stack as the driver).
// Shows whether the server certificate ARRIVES before the alert-80 abort.
import tls from "node:tls";
import dns from "node:dns/promises";

const cluster = "cluster0.kdl1dya.mongodb.net";
let shard;
try {
  const recs = await dns.resolveSrv("_mongodb._tcp." + cluster);
  shard = recs.sort((a, b) => a.priority - b.priority)[0]?.name;
} catch { /* fall through */ }
if (!shard) shard = "ac-wxcosqs-shard-00-00." + cluster;

console.log("TARGET=" + shard + ":27017");

await new Promise((resolve) => {
  const socket = tls.connect(
    { host: shard, port: 27017, servername: shard, rejectUnauthorized: false },
    () => {
      const c = socket.getPeerCertificate();
      console.log("HANDSHAKE=COMPLETED");
      console.log("SUBJECT=" + JSON.stringify(c.subject ?? {}));
      console.log("ISSUER=" + JSON.stringify(c.issuer ?? {}));
      socket.destroy();
      resolve();
    }
  );
  socket.setTimeout(12000);
  socket.on("peerCertificate", () => console.log("EVENT=peerCertificate arrived"));
  socket.on("data", () => {}); // drain any pre-handshake bytes
  socket.on("error", (e) => {
    console.log("HANDSHAKE=FAILED");
    console.log("ERROR_NAME=" + e.name);
    console.log("ERROR_MSG=" + String(e.message).replace(/\s+/g, " ").trim());
    resolve();
  });
  socket.on("timeout", () => {
    console.log("HANDSHAKE=TIMEOUT");
    socket.destroy();
    resolve();
  });
});
console.log("TLS_PROBE_DONE");