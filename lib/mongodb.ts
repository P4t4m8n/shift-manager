import { MongoClient } from "mongodb";

import type { Db } from "mongodb";
import type { Block, NewDoc, ScheduleEvent, Shift, User } from "@/lib/types";

export const getDb = async (): Promise<Db> => {
  const db = (await getClient()).db(process.env.MONGODB_DB ?? "shift-manager");
  globalForMongo.mongoIndexes ??= ensureIndexes(db);
  await globalForMongo.mongoIndexes;
  return db;
};

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
};

const ensureIndexes = async (db: Db) => {
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
};

export const users = async () => {
  return (await getDb()).collection<NewDoc<User>>("users");
};
export const shifts = async () => {
  return (await getDb()).collection<NewDoc<Shift>>("shifts");
};
export const blocks = async () => {
  return (await getDb()).collection<NewDoc<Block>>("blocks");
};
export const events = async () => {
  return (await getDb()).collection<NewDoc<ScheduleEvent>>("events");
};
