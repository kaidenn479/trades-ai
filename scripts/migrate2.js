const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.resolve(__dirname, "../prisma/dev.db"));

const alters = [
  "ALTER TABLE Technician ADD COLUMN stripePublishableKey TEXT",
  "ALTER TABLE Technician ADD COLUMN stripeSecretKey TEXT"
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
