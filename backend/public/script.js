const map = L.map("map").setView([4.7110, -74.0721], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
}).addTo(map);

let markers = {};
let vehiclesData = [];

async function cargarVehiculos() {

    try {

        const response = await fetch("/vehicles");

        const vehicles = await response.json();

        vehiclesData = vehicles;

        actualizarDashboard(vehicles);

    } catch (error) {

        console.error(error);

    }

}

function actualizarDashboard(vehicles) {

    Object.values(markers).forEach(marker => map.removeLayer(marker));

    markers = {};

    const tbody = document.querySelector("#tablaVehiculos tbody");

    tbody.innerHTML = "";

    let moving = 0;
    let offline = 0;

    vehicles.forEach(vehicle => {

        if (vehicle.status === "En movimiento") moving++;

        if (vehicle.status === "Sin señal") offline++;

        let badge = "";

        switch (vehicle.status) {

            case "En movimiento":
                badge = `<span class="badge green">${vehicle.status}</span>`;
                break;

            case "Detenido":
                badge = `<span class="badge orange">${vehicle.status}</span>`;
                break;

            default:
                badge = `<span class="badge red">${vehicle.status}</span>`;

        }

        const marker = L.marker([
            vehicle.last_lat,
            vehicle.last_lng
        ]).addTo(map);

        marker.bindPopup(`
            <b>${vehicle.vehicle_id}</b><br>
            ${vehicle.status}
        `);

        markers[vehicle.vehicle_id] = marker;

        tbody.innerHTML += `
            <tr>

                <td>${vehicle.vehicle_id}</td>

                <td>${badge}</td>

                <td>${vehicle.last_lat}</td>

                <td>${vehicle.last_lng}</td>

                <td>${vehicle.last_seen}</td>

                <td>

                    <button
                        class="btn"
                        onclick="centrarVehiculo('${vehicle.vehicle_id}')">

                        Ver

                    </button>

                </td>

            </tr>
        `;

    });

    document.getElementById("totalVehicles").innerText = vehicles.length;

    document.getElementById("movingVehicles").innerText = moving;

    document.getElementById("offlineVehicles").innerText = offline;

    document.getElementById("lastUpdate").innerText =
        "Última actualización: " + new Date().toLocaleTimeString();

}

function centrarVehiculo(id){

    const vehicle = vehiclesData.find(v => v.vehicle_id === id);

    if(!vehicle) return;

    map.setView([
        vehicle.last_lat,
        vehicle.last_lng
    ],15);

    markers[id].openPopup();

}

document.getElementById("searchInput")
.addEventListener("keyup",function(){

    const texto = this.value.toLowerCase();

    const filtrados = vehiclesData.filter(v =>

        v.vehicle_id.toLowerCase().includes(texto)

    );

    actualizarDashboard(filtrados);

});

cargarVehiculos();

setInterval(cargarVehiculos,5000);