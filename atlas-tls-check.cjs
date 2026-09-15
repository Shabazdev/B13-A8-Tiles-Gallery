const tls = require("node:tls");

const host = process.env.ATLAS_HOST;
if (!host) {
  console.log("ATLAS_HOST not set");
  process.exit(1);
}

const socket = tls.connect(
  {
    host,
    port: 27017,
    servername: host,
    rejectUnauthorized: true,
    timeout: 10000,
  },
  () => {
    console.log("TLS_TO_ATLAS_SUCCESS");
    socket.end();
    process.exit(0);
  }
);

socket.on("error", (err) => {
  console.log("TLS_TO_ATLAS_FAIL");
  console.log("CODE:", err.code);
  console.log("MESSAGE:", err.message.split("\n")[0]);
  process.exit(1);
});

socket.setTimeout(10000);
socket.on("timeout", () => {
  console.log("TLS_TO_ATLAS_TIMEOUT");
  socket.destroy();
  process.exit(1);
});
