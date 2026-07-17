const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/gps.db", (err) => {
    if (err) {
        console.error("Error al conectar la base de datos:", err.message);
    } else {
        console.log("✅ Base de datos SQLite conectada");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS gps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_id TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            timestamp TEXT NOT NULL
        )
    `);
});

module.exports = db;