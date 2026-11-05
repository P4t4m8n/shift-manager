import { MongoClient, type Db } from "mongodb";
import type { Block, ScheduleEvent, Shift, User } from "@/lib/types";

// Reused across hot reloads in dev so we don't open a new connection on every edit.
const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: Promise<MongoClient>;
  mongoIndexes?: Promise<void>;
};

const getClient = (): Promise<MongoClient> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  globalForMongo.mongoClient ??= new MongoClient(uri).connect();
  return globalForMongo.mongoClient;
}

export async function getDb(): Promise<Db> {
  const db = (await getClient()).db(process.env.MONGODB_DB ?? "shift-manager");
  globalForMongo.mongoIndexes ??= ensureIndexes(db);
  await globalForMongo.mongoIndexes;
  return db;
}

const ensureIndexes = async (db: Db) =>  {
  await Promise.all([
    db
      .collection("users")
      .createIndex({ phone: 1 }, { unique: true }, undefined),
    db.collection("shifts").createIndex({ date: 1 }, undefined, undefined),
    db.collection("events").createIndex({ date: 1 }, undefined, undefined),
    db
      .collection("blocks")
      .createIndex({ startAt: 1, endAt: 1 }, undefined, undefined),
  ]);
}

export async function users() {
  return (await getDb()).collection<User>("users");
}
export async function shifts() {
  return (await getDb()).collection<Shift>("shifts");
}
export async function blocks() {
  return (await getDb()).collection<Block>("blocks");
}
export async function events() {
  return (await getDb()).collection<ScheduleEvent>("events");
}
