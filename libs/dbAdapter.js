import { Low, JSONFile } from "lowdb";
import pkgPG from "pg";
import Database from "better-sqlite3";
import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";

const { Pool } = pkgPG;

export async function createDatabase() {
  const driver = (process.env.DB_DRIVER || "lowdb").toLowerCase();

  if (driver === "lowdb") return initLowDB();
  if (driver === "postgres") return initPostgres();
  if (driver === "sqlite") return initSQLite();
  if (driver === "mariadb") return initMariaDB();
  if (driver === "mongodb") return initMongoDB();

  throw new Error("❌ DB_DRIVER inválido");
}

/* =======================
   BASE
======================= */
function baseSchema() {
  return {
    users: {},
    chats: {},
    settings: {},
    game: {},
    others: {},
    sticker: {},
  };
}

/* =======================
   LOWDB
======================= */
async function initLowDB() {
  const db = new Low(new JSONFile("./database.json"));
  await db.read();
  db.data ||= baseSchema();
  setInterval(() => db.write(), 30_000);
  console.log("🟢 DB: LowDB");
  return db;
}

/* =======================
   POSTGRES
======================= */
async function initPostgres() {
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );
  `);

  return kvAdapter(
    async () => {
      const r = await pool.query("SELECT key, value FROM kv_store");
      return r.rows;
    },
    async (k, v) => {
      await pool.query(
        `INSERT INTO kv_store (key,value)
         VALUES ($1,$2)
         ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`,
        [k, v]
      );
    },
    "PostgreSQL"
  );
}

/* =======================
   SQLITE
======================= */
async function initSQLite() {
  const dbSQL = new Database(process.env.SQLITE_PATH || "./database.sqlite");

  dbSQL.exec(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  return kvAdapter(
    () => dbSQL.prepare("SELECT key,value FROM kv_store").all(),
    (k, v) =>
      dbSQL
        .prepare(
          "INSERT INTO kv_store (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=?"
        )
        .run(k, JSON.stringify(v), JSON.stringify(v)),
    "SQLite"
  );
}

/* =======================
   MARIADB / MYSQL
======================= */
async function initMariaDB() {
  const conn = await mysql.createConnection(process.env.MYSQL_URL);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS kv_store (
      k VARCHAR(255) PRIMARY KEY,
      v JSON NOT NULL
    );
  `);

  return kvAdapter(
    async () => {
      const [rows] = await conn.query("SELECT k AS key, v AS value FROM kv_store");
      return rows;
    },
    async (k, v) => {
      await conn.query(
        "INSERT INTO kv_store (k,v) VALUES (?,?) ON DUPLICATE KEY UPDATE v=?",
        [k, v, v]
      );
    },
    "MariaDB"
  );
}

/* =======================
   MONGODB
======================= */
async function initMongoDB() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();

  const col = client.db().collection("kv_store");

  return kvAdapter(
    async () => col.find({}).toArray(),
    async (k, v) =>
      col.updateOne(
        { key: k },
        { $set: { key: k, value: v } },
        { upsert: true }
      ),
    "MongoDB"
  );
}

/* =======================
   KV ADAPTER (CORE)
======================= */
async function kvAdapter(loadFn, saveFn, name) {
  const data = baseSchema();
  const rows = await loadFn();

  for (const r of rows) {
    data[r.key] = r.value;
  }

  console.log(`🟢 DB: ${name}`);

  return {
    data,
    async write() {
      for (const k of Object.keys(data)) {
        await saveFn(k, data[k]);
      }
    },
  };
}
