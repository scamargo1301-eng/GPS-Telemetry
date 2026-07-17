require("./database/database");

const express = require("express");
const path = require("path");

const gpsRoutes = require("./routes/gpsRoutes");

const app = express();

app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rutas de la API
app.use(gpsRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});