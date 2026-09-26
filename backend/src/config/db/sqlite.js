// SQLite driver: an embedded database in a single local file. Used for local development when
// DATABASE_URL is not set. Every copy of the backend must run on the same machine to share it.
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { tables, addedColumns } = require("../schema");

const databasePath = path.resolve(process.env.SQLITE_PATH || path.join(__dirname, "../../../data/chat.sqlite"));
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

// Several local backend copies can share this file (the two-copy demo). If another copy holds
// the lock — e.g. both starting at once — wait up to 5 s instead of failing immediately.
const sqlite = new DatabaseSync(databasePath, { timeout: 5000 });
sqlite.exec("PRAGMA busy_timeout = 5000;");
sqlite.exec("PRAGMA foreign_keys = ON;");

// WAL lets several processes read and write the file together. The setting is stored in the file,
// so only the first process switches it; switching needs exclusive access and ignores the busy
// timeout, so when two copies create a new file at once, retry briefly instead of crashing.
const enableWal = () => {
  const pause = new Int32Array(new SharedArrayBuffer(4));
  for (let attempt = 1; ; attempt++) {
    try {
      if (sqlite.prepare("PRAGMA journal_mode").get().journal_mode === "wal") return;
      sqlite.exec("PRAGMA journal_mode = WAL;");
      return;
    } catch (error) {
      if (!/locked|busy/i.test(error.message) || attempt >= 100) throw error;
      Atomics.wait(pause, 0, 0, 50); // synchronous 50 ms pause; this runs once at start-up
    }
  }
};
enableWal();

// Schema setup as one write transaction: BEGIN IMMEDIATE takes the write lock up front (waiting up
// to the busy timeout), so copies starting together take turns — otherwise two can both see a
// column missing and both try to add it.
sqlite.exec("BEGIN IMMEDIATE");
try {
  for (const sql of tables) {
    sqlite.exec(sql);
  }
  for (const [table, column, definition] of addedColumns) {
    const existing = sqlite.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
    if (!existing.includes(column)) {
      sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  }
  sqlite.exec("COMMIT");
} catch (error) {
  sqlite.exec("ROLLBACK");
  throw error;
}

const normalizeValue = (value) => {
  // Optional fields arrive as undefined; SQLite can only bind NULL
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
};

const isSelectQuery = (sql) => /^\s*(select|pragma|with)\b/i.test(sql);

// mysql2-style contract shared by both drivers:
//   SELECT            -> [rows]
//   INSERT/UPDATE/... -> [{ insertId, affectedRows }]
const execute = async (sql, params = []) => {
  const statement = sqlite.prepare(sql);
  const values = params.map(normalizeValue);

  if (isSelectQuery(sql)) {
    return [statement.all(...values)];
  }

  const result = statement.run(...values);
  return [
    {
      insertId: result.lastInsertRowid === undefined ? undefined : Number(result.lastInsertRowid),
      affectedRows: Number(result.changes || 0),
    },
  ];
};

const getConnection = async () => {
  sqlite.prepare("SELECT 1").get();
  return { release() {} };
};

module.exports = {
  dialect: "sqlite",
  description: `SQLite (${databasePath})`,
  execute,
  getConnection,
  close: async () => sqlite.close(),
};
