const tls = require("tls");

// Connect directly to a resolved Atlas shard IP with proper SNI
const shardIp = "159.41.192.43";
const shardSni = "ac-wxcosqs-shard-00-00.kdl1dya.mongodb.net";

console.log(`Connecting TLS to ${shardIp}:27017 (SNI: ${shardSni})...`);

const socket = tls.connect(
  {
    host: shardIp,
    port: 27017,
    servername: shardSni,
    rejectUnauthorized: true,
    timeout: 12000,
  },
  () => {
    console.log("DIRECT_TLS_TO_SHARD_SUCCESS");
    const info = socket.getPeerCertificate(true);
    console.log("ISSUER:", info.issuer?.CN || "unknown");
    console.log("SUBJECT:", info.subject?.CN || "unknown");
    console.log("CIPHER:", JSON.stringify(socket.getCipher()));
    socket.end();
    process.exit(0);
  }
);

socket.on("error", (err) => {
  console.log("DIRECT_TLS_TO_SHARD_FAIL");
  console.log("CODE:", err.code);
  console.log("MESSAGE:", err.message.split("\n")[0]);
  console.log("SYSTEM_ERROR:", err.systemError);
  process.exit(1);
});

socket.setTimeout(12000, () => {
  console.log("DIRECT_TLS_TO_SHARD_TIMEOUT");
  socket.destroy();
  process.exit(1);
});
