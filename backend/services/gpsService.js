const db = require("../database/database");

const createGpsRecord = (vehicle_id, lat, lng, timestamp, callback) => {

    const sql = `
        INSERT INTO gps (vehicle_id, lat, lng, timestamp)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [vehicle_id, lat, lng, timestamp], function (err) {
        callback(err, this?.lastID);
    });

};

const getAllGps = (callback) => {

    db.all("SELECT * FROM gps", [], (err, rows) => {
        callback(err, rows);
    });

};

const getVehiclesStatus = (callback) => {

    const sql = `
        SELECT 
            actual.vehicle_id,
            actual.lat AS last_lat,
            actual.lng AS last_lng,
            actual.timestamp AS last_seen,
            anterior.lat AS prev_lat,
            anterior.lng AS prev_lng,
            anterior.timestamp AS prev_seen

        FROM gps actual

        LEFT JOIN gps anterior
        ON anterior.id = (
            SELECT id
            FROM gps
            WHERE vehicle_id = actual.vehicle_id
            AND id < actual.id
            ORDER BY id DESC
            LIMIT 1
        )

        WHERE actual.id IN (
            SELECT MAX(id)
            FROM gps
            GROUP BY vehicle_id
        );
    `;
    db.all(sql, [], callback);

};

const getVehicleById = (vehicleId, callback) => {

    const sql = `
        SELECT *
        FROM gps
        WHERE vehicle_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
    `;

    db.get(sql, [vehicleId], callback);

};

const deleteVehicleById = (vehicleId, callback) => {

    const sql = `
        DELETE FROM gps
        WHERE vehicle_id = ?
    `;

    db.run(sql, [vehicleId], function (err) {
        callback(err, this.changes);
    });

};

module.exports = {
    createGpsRecord,
    getAllGps,
    getVehiclesStatus,
    getVehicleById,
    deleteVehicleById
};