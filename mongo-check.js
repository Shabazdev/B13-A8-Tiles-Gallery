import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "tesserae";

if (!uri) {
  console.log("MONGODB_URI not set");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
});

try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("MONGODB_CONNECTION_SUCCESS");
  await client.close();
} catch (err) {
  console.log("FAIL_CATEGORY: " + (err.code || "NO_CODE"));
  console.log("FAIL_MESSAGE: " + (err.message || String(err)).split("\n")[0]);
  process.exit(1);
}
