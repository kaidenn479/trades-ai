const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.resolve(__dirname, "../prisma/dev.db"));

const alters = [
  "ALTER TABLE Technician ADD COLUMN plan TEXT DEFAULT 'starter'",
  "ALTER TABLE Technician ADD COLUMN brandColor TEXT DEFAULT '#f97316'",
  "ALTER TABLE Technician ADD COLUMN messageCount INTEGER DEFAULT 0",
  "ALTER TABLE Technician ADD COLUMN messageResetAt TEXT"
];

for (const sql of alters) {
  try {
    db.exec(sql);
    console.log("Added: " + sql.match(/ADD COLUMN (\w+)/)[1]);
  } catch {
    console.log("Skipped (exists): " + sql.match(/ADD COLUMN (\w+)/)[1]);
  }
}

db.close();
console.log("Done.");
