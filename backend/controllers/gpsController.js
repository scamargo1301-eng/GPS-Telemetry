const gpsService = require("../services/gpsService");
const db = require("../database/database");


const getGps = (req, res) => {

    db.all("SELECT * FROM gps", [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    });

};

const createGpsRecord = (req, res) => {

    const { vehicle_id, lat, lng, timestamp } = req.body;

     console.log("Body recibido:", req.body);
    console.log("Timestamp:", timestamp);
    

  if (!vehicle_id || lat === undefined || lng === undefined || !timestamp){
        return res.status(400).json({
            error: "Todos los campos son obligatorios."
        });
    }
 console.log("Pasó la validación de campos");

    if (isNaN(Date.parse(timestamp))) {
        console.log("❌ Timestamp inválido");

        return res.status(400).json({
            error: "El timestamp debe estar en formato ISO 8601."
        });
    }

    console.log("✅ Timestamp válido");


    // Validar latitud
    if (lat < -90 || lat > 90) {
        return res.status(400).json({
            error: "Latitud inválida."
        });
    }

    // Validar longitud
    if (lng < -180 || lng > 180) {
        return res.status(400).json({
            error: "Longitud inválida."
        });
    }
    const sql = `
        INSERT INTO gps (vehicle_id, lat, lng, timestamp)
        VALUES (?, ?, ?, ?)
    `;

   gpsService.createGpsRecord(
    vehicle_id,
    lat,
    lng,
    timestamp,
    (err, id) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.status(201).json({
            mensaje: "GPS guardado correctamente",
            id
        });

    }
);
};

const updateGps = (req, res) => {

    const { id } = req.params;
    const { vehicle_id, lat, lng, timestamp } = req.body;

    const sql = `
        UPDATE gps
        SET vehicle_id = ?, lat = ?, lng = ?, timestamp = ?
        WHERE id = ?
    `;

    db.run(sql, [vehicle_id, lat, lng, timestamp, id], function (err) {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                mensaje: "No se encontró el registro"
            });
        }

        res.json({
            mensaje: "GPS actualizado correctamente"
        });

    });
    }; 
const deleteGps = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM gps
        WHERE id = ?
    `;

    db.run(sql, [id], function (err) {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                mensaje: "No se encontró el registro"
            });
        }

        res.json({
            mensaje: "GPS eliminado correctamente"
        });

    });

};



  const getVehicles = (req, res) => {

    gpsService.getVehiclesStatus((err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        const now = new Date();

        rows.forEach(vehicle => {

            const lastSeen = new Date(vehicle.last_seen);

            const diffSeconds = (now - lastSeen) / 1000;

            console.log("Ahora:", now.toISOString());
            console.log("Última señal:", vehicle.last_seen);
            console.log("Diferencia:", diffSeconds);


            const samePosition =
                vehicle.last_lat === vehicle.prev_lat &&
                vehicle.last_lng === vehicle.prev_lng;


            const stoppedSeconds = vehicle.prev_seen
                ? (new Date(vehicle.last_seen) - new Date(vehicle.prev_seen)) / 1000
                : 0;


            if (diffSeconds > 120) {

                vehicle.status = "Sin señal";

            } else if (samePosition && stoppedSeconds > 60) {

                vehicle.status = "Detenido";

            } else {

                vehicle.status = "En movimiento";

            }

        });

        res.json(rows);

    });
};

const getVehicleById = (req, res) => {

    const { id } = req.params;

    gpsService.getVehicleById(id, (err, vehicle) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!vehicle) {
            return res.status(404).json({
                mensaje: "Vehículo no encontrado"
            });
        }

        res.json(vehicle);

    });

};

const deleteVehicleById = (req, res) => {

    const { id } = req.params;

    gpsService.deleteVehicleById(id, (err, changes) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (changes === 0) {
            return res.status(404).json({
                mensaje: "Vehículo no encontrado"
            });
        }

        res.json({
            mensaje: "Vehículo eliminado correctamente"
        });

    });

};

module.exports = {
    createGpsRecord,
    getGps,
    getVehicles,
    updateGps,
    deleteGps,
    getVehicleById,
    deleteVehicleById
};