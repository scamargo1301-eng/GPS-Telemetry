const express = require("express");

const router = express.Router();

const {
    createGpsRecord,
    getGps,
    updateGps,
    getVehicles,
    getVehicleById,
    deleteGps,
    deleteVehicleById

} = require("../controllers/gpsController");

router.post("/gps", createGpsRecord);

router.get("/gps", getGps);

router.put("/gps/:id", updateGps);

router.delete("/gps/:id", deleteGps);

router.get("/vehicles", getVehicles);

router.get("/vehicles/:id", getVehicleById);

router.delete("/vehicles/:id", deleteVehicleById);

module.exports = router;