const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.resolve(__dirname, "../prisma/dev.db"));

// Idempotent: each ALTER is skipped if the column already exists
const alters = [
  // From migrate.js (re-run safe)
  "ALTER TABLE Technician ADD COLUMN plan TEXT DEFAULT 'starter'",
  "ALTER TABLE Technician ADD COLUMN brandColor TEXT DEFAULT '#f97316'",
  "ALTER TABLE Technician ADD COLUMN messageCount INTEGER DEFAULT 0",
  "ALTER TABLE Technician ADD COLUMN messageResetAt TEXT",
  // From migrate2.js (re-run safe)
  "ALTER TABLE Technician ADD COLUMN stripePublishableKey TEXT",
  "ALTER TABLE Technician ADD COLUMN stripeSecretKey TEXT",
  // New: soft-delete support
  "ALTER TABLE Technician ADD COLUMN status TEXT DEFAULT 'active'",
  "ALTER TABLE Technician ADD COLUMN deletedAt TEXT",
];

for (const sql of alters) {
  const col = sql.match(/ADD COLUMN (\w+)/)[1];
  try {
    db.exec(sql);
    console.log("✓ Added:", col);
  } catch {
    console.log("· Exists:", col);
  }
}

db.close();
console.log("\nDone — all columns in sync.");
