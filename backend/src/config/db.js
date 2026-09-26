// The database used by every service. Chooses a driver from the environment:
//   DATABASE_URL set  -> PostgreSQL (Supabase, Azure, or a local container)  — db/postgres.js
//   otherwise         -> SQLite file in backend/data/                         — db/sqlite.js
// Both expose execute(sql, params) with "?" placeholders, so services are identical for either.
const driver = process.env.DATABASE_URL ? require("./db/postgres") : require("./db/sqlite");
const seedDemoData = require("./seed");

// Demo users (with a password written in seed.js) are only created where that's safe:
// by default for local SQLite, never for PostgreSQL unless SEED_DEMO_DATA=true is set on purpose.
const seedByDefault = driver.dialect === "sqlite";
const shouldSeed = (process.env.SEED_DEMO_DATA ?? String(seedByDefault)) === "true";

// Resolves once tables exist (and demo data, if enabled). server.js waits for it before listening.
const ready = (async () => {
  if (driver.init) await driver.init();
  if (shouldSeed && (await seedDemoData(driver))) {
    console.log("[db] seeded demo data");
  }
  console.log(`[db] ready: ${driver.description}`);
})();

module.exports = { ...driver, ready };
