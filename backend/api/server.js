const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

// server.js (al inicio del archivo)
const conexion = require('./db/connection');

require('dotenv').config();

const corsOptions = {
  origin: [
    'http://localhost:5500', 
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Habilita logging de consultas SQL
conexion.on('query', (query) => {
  console.log('🔍 SQL Query:', query.sql);
  console.log('🔍 Parámetros:', query.values);
});

conexion.on('error', (err) => {
  console.error('🔴 Error MySQL:', err);
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

// En tu server.js, antes de las rutas
app.use((req, res, next) => {
  console.log('Request body:', req.body);
  next();
});

// Ruta para Catalogo Camila G.
const catalogRoutes = require("./routes/catalogRoutes");
app.use("/api/catalog", catalogRoutes);

// Rutas de autenticación
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);


// Rutas CRUD (incluyendo productos y filtrado)
const crudRoutes = require("./routes/crud");
app.use("/api", crudRoutes);

// Rutas de administración
const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);














// // Rutas de ventas (NUEVO)
// const ventasRoutes = require("./routes/ventas");
// app.use("/api/ventas", ventasRoutes);

// Ruta de inicio (opcional)
app.get("/", (req, res) => {
  res.send("Ruta Inicio");
});

// Política de seguridad de contenido (opcional, revisar según el despliegue)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://cdnjs.cloudflare.com"
  );
  next();
});

// Servir el frontend estático
app.use(express.static(path.join(__dirname, "frontend")));

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
  console.log("Servidor corriendo en el puerto:", puerto);
});