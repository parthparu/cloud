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
sqlite.exec("PRAGMA journal_mode = WAL;");

for (const sql of tables) {
  sqlite.exec(sql);
}

for (const [table, column, definition] of addedColumns) {
  const existing = sqlite.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!existing.includes(column)) {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
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
