# 🚗 Sistema de Monitoreo GPS en Tiempo Real

![Node.js](https://img.shields.io/badge/Node.js-22+-green?style=for-the-badge\&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge\&logo=express)
![SQLite](https://img.shields.io/badge/SQLite-Database-blue?style=for-the-badge\&logo=sqlite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge\&logo=javascript)

---

#  Descripción

Sistema desarrollado para el monitoreo de vehículos mediante una API REST, permitiendo registrar, consultar, actualizar y eliminar (CRUD) posiciones GPS en tiempo real.

La aplicación recibe coordenadas geográficas enviadas por los vehículos, las almacena en una base de datos SQLite y determina automáticamente el estado de cada vehículo según la información más reciente recibida.

Además, el proyecto cuenta con una interfaz web desarrollada en HTML, CSS y JavaScript que permite visualizar la información de forma sencilla e intuitiva.

---

#  Características

* Registro de posiciones GPS.
* Consulta del historial de ubicaciones.
* Actualización de registros.
* Eliminación de registros.
* Consulta del estado actual de los vehículos.
* Validación de datos recibidos.
* Persistencia mediante SQLite.
* Interfaz web con mapa interactivo utilizando Leaflet.
* Arquitectura organizada por capas (Routes, Controllers y Services).

---

#  Tecnologías utilizadas

| Tecnología | Descripción             |
| ---------- | ----------------------- |
| Node.js    | Entorno de ejecución    |
| Express.js | Framework Backend       |
| SQLite     | Base de datos           |
| JavaScript | Lógica del sistema      |
| HTML5      | Interfaz Web            |
| CSS3       | Diseño de la aplicación |
| Leaflet.js | Visualización del mapa  |

---

#  Estructura del proyecto

```text
gps_telemetry/
│
├── backend/
│   ├── controllers/
│   ├── database/
│   ├── routes/
│   └── services/
│
├── public/
│   ├── index.html
│   ├── script.js
│   └── styles.css
│
├── package.json
├── server.js
└── README.md
```

---

#  Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/gps_telemetry.git
```

## 2. Ingresar al proyecto

```bash
cd gps_telemetry
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Ejecutar el servidor

```bash
npm start - node index.js
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

---

#  API REST

## Obtener todos los registros

```http
GET /gps
```

---

## Obtener un registro por ID

```http
GET /gps/:id
```

---

## Registrar una ubicación

```http
POST /gps
```

### Body

```json
{
  "vehicle_id": "ABC123",
  "lat": 4.60971,
  "lng": -74.08175,
  "timestamp": "2026-07-16T18:00:00Z"
}
```

---

## Actualizar una ubicación

```http
PUT /gps/:id
```

### Body

```json
{
  "vehicle_id": "ABC123",
  "lat": 4.61020,
  "lng": -74.08210,
  "timestamp": "2026-07-16T18:05:00Z"
}
```

---

## Eliminar un registro

```http
DELETE /gps/:id
```

---

## Consultar estado de todos los vehículos

```http
GET /vehicles
```

### Ejemplo de respuesta

```json
[
  {
    "vehicle_id": "ABC123",
    "last_lat": 4.60971,
    "last_lng": -74.08175,
    "last_seen": "2026-07-16T18:05:00Z",
    "status": "En movimiento"
  }
]
```

---

#  Base de datos

El sistema utiliza **SQLite** para almacenar las posiciones GPS reportadas por los vehículos.

### Tabla principal

```text
gps
```

### Campos

| Campo      | Descripción                |
| ---------- | -------------------------- |
| id         | Identificador único        |
| vehicle_id | Identificador del vehículo |
| lat        | Latitud                    |
| lng        | Longitud                   |
| timestamp  | Fecha y hora del reporte   |

---

#  Interfaz Web

La aplicación incorpora una interfaz web que permite:

* Visualizar el mapa interactivo.
* Consultar la ubicación de los vehículos.
* Visualizar el estado actual de cada vehículo.

---

#  Validaciones

El sistema realiza las siguientes validaciones:

* Verificación de campos obligatorios.
* Validación del formato del timestamp (ISO 8601).
* Validación de coordenadas geográficas.
* Verificación de existencia del registro antes de actualizar o eliminar.
* Manejo de errores y respuestas HTTP apropiadas.

---

#  Lógica de determinación de estados

El estado de cada vehículo se calcula automáticamente utilizando la última información GPS registrada en la base de datos.

Para ello, el sistema compara la posición más reciente con el registro anterior del mismo vehículo y calcula el tiempo transcurrido desde la última actualización.

## 🟢 En movimiento

El vehículo se considera **En movimiento** cuando:

* Se recibió información hace menos de **60 segundos**.
* La última posición es diferente de la anterior.

### Ejemplo

```text
Registro anterior
Lat: 4.60971
Lng: -74.08175

Último registro
Lat: 4.61035
Lng: -74.08210

Tiempo transcurrido: 25 segundos

Estado: En movimiento
```

---

## 🟡 Detenido

El vehículo se considera **Detenido** cuando:

* Continúa enviando datos.
* Las coordenadas no cambian.
* Han pasado más de **60 segundos** sin movimiento.

### Ejemplo

```text
Registro anterior
Lat: 4.60971
Lng: -74.08175

Último registro
Lat: 4.60971
Lng: -74.08175

Tiempo transcurrido: 90 segundos

Estado: Detenido
```

---

## 🔴 Sin señal

El vehículo se considera **Sin señal** cuando:

* Han pasado más de **120 segundos** desde el último reporte recibido.

### Ejemplo

```text
Último reporte
18:05:00

Hora actual
18:08:10

Tiempo transcurrido
190 segundos

Estado: Sin señal
```

---

##  Flujo de decisión

```text
¿Han pasado más de 120 segundos desde el último reporte?

            │
      ┌─────┴─────┐
      │           │
     Sí          No
      │           │
Sin señal    ¿Cambió la posición?
                  │
           ┌──────┴──────┐
           │             │
          Sí            No
           │             │
 En movimiento     Detenido
```

Esta lógica permite clasificar automáticamente el estado de cada vehículo utilizando únicamente las coordenadas GPS y la marca de tiempo de los registros almacenados.

---

#  Posibles mejoras

* Actualización en tiempo real usando WebSockets.
* Historial de recorridos por vehículo.
* Filtros por fecha y vehículo.
* Implementación de pruebas unitarias e integración.
* Despliegue en la nube.

---
# Reporte de uso de Inteligencia Artificial

La inteligencia artificial se utilizó como herramienta de apoyo durante el desarrollo del proyecto, principalmente para mejorar la interfaz gráfica y la documentación.

Uso de la IA
Interfaz gráfica: Se solicitaron sugerencias para mejorar la distribución de los elementos de la página, la organización del mapa, los formularios y el diseño visual mediante HTML y CSS.
Backend: Se utilizó apoyo para resolver dudas puntuales sobre la estructura de algunas rutas y la validación básica de datos en la API REST.
Documentación: Se empleó para la elaboración y organización del archivo README y la explicación de la lógica utilizada para determinar los estados de los vehículos.
Conclusión

Las sugerencias proporcionadas por la IA fueron revisadas, adaptadas e implementadas manualmente, utilizando esta herramienta únicamente como apoyo durante el desarrollo del proyecto.

---

#  Autor

**Samuel Camargo**

Proyecto desarrollado como práctica de desarrollo Backend utilizando Node.js, Express y SQLite para la implementación de una API REST orientada al monitoreo de vehículos mediante coordenadas GPS.

---

#  Licencia

Este proyecto fue desarrollado con fines evaluativos. Puede utilizarse como referencia para proyectos de aprendizaje y desarrollo de aplicaciones basadas en servicios REST.

