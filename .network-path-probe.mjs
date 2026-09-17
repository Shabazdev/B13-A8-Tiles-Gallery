// TEMP DIAG 3 — is alert-80 specific to this Atlas endpoint, or does TLS on
// non-443 ports fail network-wide (proxy/ISP/firewall middlebox)?
// Read-only: TLS probes to unrelated hosts + DoH DNS cross-check.
import tls from "node:tls";
import { Resolver } from "node:dns/promises";

const CLUSTER = "cluster0.kdl1dya.mongodb.net";
const SHARD = "ac-wxcosqs-shard-00-00." + CLUSTER;

function attempt(label, opts) {
  return new Promise((resolve) => {
    const started = Date.now();
    let sawCert = false;
    const socket = tls.connect(opts, () => {
      console.log(
        label + " => OK tls=" + socket.getProtocol() +
        " issuer=" + JSON.stringify(socket.getPeerCertificate().issuer ?? {}).slice(0, 70)
      );
      socket.destroy();
      resolve();
    });
    socket.setTimeout(9000);
    socket.on("peerCertificate", () => { sawCert = true; });
    socket.on("data", () => {});
    socket.on("error", (e) => {
      console.log(
        label + " => FAIL certArrived=" + (sawCert ? "yes" : "no") +
        " ms=" + (Date.now() - started) +
        " :: " + String(e.message).split("\n")[0].replace(/\s+/g, " ").trim()
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

// Control group: TLS on ports other than 443 — if these pass, the network is
// not generically blocking/interfering with non-standard TLS ports.
await attempt("control imap.gmail.com:993", {
  host: "imap.gmail.com", port: 993, servername: "imap.gmail.com", rejectUnauthorized: false,
});
await attempt("control smtp.gmail.com:465", {
  host: "smtp.gmail.com", port: 465, servername: "smtp.gmail.com", rejectUnauthorized: false,
});
await attempt("control 1.1.1.1:853 (DoT)", {
  host: "1.1.1.1", port: 853, servername: "cloudflare-dns.com", rejectUnauthorized: false,
});
// Same-region Atlas neighbor: is it the whole ap-south-1 path, or our cluster only?
await attempt("control atlas-shard-00-00 (cluster0 elsewhere)", {
  host: "ac-wxcosqs-shard-00-00.u6n69.mongodb.net", port: 27017,
  servername: "ac-wxcosqs-shard-00-00.u6n69.mongodb.net", rejectUnauthorized: false,
},);

// DNS cross-check: system resolver vs Cloudflare DoH (443 is known-good).
const system = await new Resolver().resolve4(SHARD).catch((e) => ["ERR:" + e.code]);
const dohRes = new Resolver();
dohRes.setServers(["1.1.1.1", "8.8.8.8"]);
const external = await dohRes.resolve4(SHARD).catch((e) => ["ERR:" + e.code]);
console.log("DNS system=" + JSON.stringify(system) + " external=" + JSON.stringify(external));

// If system DNS is hijacked, the "real" IPs may still speak TLS correctly.
for (const ip of external.filter((x) => !String(x).startsWith("ERR:"))) {
  await attempt("atlas via external DNS IP " + ip + ":27017", {
    host: ip, port: 27017, servername: SHARD, rejectUnauthorized: false,
  });
}

console.log("PROBE3_DONE");
