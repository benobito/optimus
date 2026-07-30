import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

const file = process.env.VERCEL
  ? path.join("/tmp", "db.json")
  : path.join(process.cwd(), "data", "db.json");
const adapter = new JSONFile(file);

// Default shape used if db.json is ever missing/empty.
const defaultData = { games: [], orders: [], settings: {} };

let dbInstance = null;

/**
 * Get a ready-to-use lowdb instance. Call `await db.read()` is already
 * handled here so callers can immediately use `db.data`.
 */
export async function getDb() {
  if (!dbInstance) {
    dbInstance = new Low(adapter, defaultData);
    await dbInstance.read();
    dbInstance.data ||= defaultData;
  } else {
    await dbInstance.read();
  }
  return dbInstance;
}

export async function saveDb(db) {
  await db.write();
}
