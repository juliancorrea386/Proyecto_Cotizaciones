require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());
const productosRoutes = require('./routes/productos');
app.use('/api/productos', productosRoutes);

const clientesRoutes = require('./routes/clientes');
app.use('/api/clientes', clientesRoutes);
// Pool de conexiones

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const cotizacionesRoutes = require("./routes/cotizaciones");
app.use("/api/cotizaciones", cotizacionesRoutes);


const reportesRoutes = require("./routes/reportes");
app.use("/api/reportes", reportesRoutes);

const recibosRoutes = require("./routes/recibos");
app.use("/api/recibos", recibosRoutes);

const movimientosRoutes = require("./routes/movimientos");
app.use("/api/movimientos", movimientosRoutes);

const carteraRoutes = require("./routes/cartera");
app.use("/api/cartera", carteraRoutes);

const municipiosRoutes = require('./routes/municipios');
app.use('/api/municipios', municipiosRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API de clientes escuchando en http://localhost:${PORT}`);
});
