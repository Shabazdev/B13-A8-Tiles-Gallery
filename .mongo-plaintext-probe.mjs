// TEMP DIAG 4 — decisive split: send a plaintext MongoDB OP_MSG `hello` to the
// shard IP. If the real mongod answers, the endpoint is reachable and only TLS
// is being rejected; if the socket just dies, the port-27017 path is filtered.
// Read-only: one TCP write, ~9s cap, prints raw response bytes only.
import net from "node:net";

const HOST = "159.41.192.43";
const PORT = 27017;

function bson(doc) {
  // Minimal BSON encoder: enough for { hello: 1, $db: "admin" }.
  const int32 = (n) => {
    const b = Buffer.alloc(4);
    b.writeInt32LE(n);
    return b;
  };
  const cstr = (s) => Buffer.concat([Buffer.from(s, "utf8"), Buffer.from([0])]);
  const str = (s) => {
    const body = Buffer.from(s, "utf8");
    return Buffer.concat([int32(body.length + 1), body, Buffer.from([0])]);
  };
  const parts = [];
  for (const [k, v] of Object.entries(doc)) {
    parts.push(typeof v === "number" && Number.isInteger(v)
      ? Buffer.concat([Buffer.from([0x10]), cstr(k), int32(v)])
      : Buffer.concat([Buffer.from([0x02]), cstr(k), str(String(v))]));
  }
  const body = Buffer.concat(parts);
  return Buffer.concat([int32(4 + body.length + 1), body, Buffer.from([0])]);
}

const payload = bson({ hello: 1, $db: "admin" });
const header = Buffer.alloc(16);
header.writeInt32LE(16 + 4 + payload.length, 0); // messageLength
header.writeInt32LE(1, 4);                        // requestID
header.writeInt32LE(0, 8);                        // responseTo
header.writeInt32LE(2013, 12);                    // opCode = OP_MSG
const frame = Buffer.concat([header, Buffer.alloc(4), Buffer.from([0]), payload]); // flagBits + kind 0

const socket = net.connect({ host: HOST, port: PORT });
const started = Date.now();
socket.setTimeout(9000);
socket.on("connect", () => {
  console.log("TCP=CONNECTED ms=" + (Date.now() - started));
  socket.write(frame);
  console.log("SENT=OP_MSG hello (" + frame.length + " bytes)");
});
socket.on("data", (d) => {
  console.log("RECV_BYTES=" + d.length + " ms=" + (Date.now() - started));
  console.log("RECV_HEX=" + d.subarray(0, 64).toString("hex"));
  const ascii = d.toString("latin1").replace(/[^\x20-\x7e]+/g, " ").trim();
  if (ascii) console.log("RECV_ASCII=" + ascii.slice(0, 300));
});
socket.on("close", (hadErr) => {
  console.log("CLOSED ms=" + (Date.now() - started) + " hadError=" + hadErr);
});
socket.on("error", (e) => {
  console.log("SOCKET_ERROR=" + String(e.message).split("\n")[0]);
});
socket.on("timeout", () => {
  console.log("STALLED_NO_RESPONSE ms=" + (Date.now() - started));
  socket.destroy();
});
setTimeout(() => process.exit(0), 10000).unref();
