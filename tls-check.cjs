const https = require("https");

const start = Date.now();
https.get("https://www.google.com", {
  servername: "www.google.com",
  timeout: 10000,
}, (res) => {
  console.log("TLS_TO_GOOGLE_SUCCESS");
  console.log("STATUS:", res.statusCode);
  console.log("TIME_MS:", Date.now() - start);
  process.exit(0);
}).on("error", (err) => {
  console.log("TLS_TO_GOOGLE_FAIL");
  console.log("CODE:", err.code);
  console.log("MESSAGE:", err.message.split("\n")[0]);
  process.exit(1);
});
