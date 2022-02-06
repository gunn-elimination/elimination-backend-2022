import { MongoClient } from "mongodb";
import { env } from "./env";
import { RESTServer } from "./src/Utils/RESTServer";
declare global {
  var MongoDB: MongoClient;
}
globalThis.MongoDB = new MongoClient(env.mongo, {});
console.log("Connecting to MongoDB...");
MongoDB.connect().then(() => {
  console.log("Connected to MongoDB");
  const server = RESTServer();
});
