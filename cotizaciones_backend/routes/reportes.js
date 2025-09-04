const express = require('express');
const router = express.Router();
const pool = require('../db');
const PDFDocument = require("pdfkit");
require("pdfkit-table");


// RUTA: /api/reportes/inventario
router.get('/inventario', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query = `
            SELECT 
                p.id,
                p.nombre,
                p.referencia,
                SUM(cd.cantidad) AS total_salidas
            FROM cotizacion_detalles cd
            JOIN productos p ON cd.producto_id = p.id
            JOIN cotizaciones c ON cd.cotizacion_id = c.id
            WHERE 1=1
        `;
    const params = [];

    // Filtro de fechas
    if (desde && hasta) {
      query += " AND DATE(c.fecha) BETWEEN ? AND ? ";
      params.push(desde, hasta);
    }

    query += `
            GROUP BY p.id, p.nombre
            ORDER BY total_salidas DESC
        `;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error en reporte inventario:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/ReporteVentas", async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) {
      return res.status(400).json({ error: "Se requieren las fechas desde y hasta" });
    }

    // 1. Cotizaciones a crédito
    const [creditos] = await pool.query(
      `SELECT c.id, c.numero_cotizacion, c.fecha, cli.nombre AS cliente, c.subtotal
       FROM cotizaciones c
       JOIN clientes cli ON cli.id = c.cliente_id
       WHERE c.tipo = 'credito' 
         AND DATE(c.fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    // 2. Ventas de contado
    const [contado] = await pool.query(
      `SELECT c.id, c.numero_cotizacion, c.fecha, cli.nombre AS cliente, c.subtotal
       FROM cotizaciones c
       JOIN clientes cli ON cli.id = c.cliente_id
       WHERE c.tipo = 'contado' 
         AND DATE(c.fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    // 3. Abonos realizados en el rango
    const [abonos] = await pool.query(
      `SELECT r.numero_recibo, r.fecha, cli.nombre AS cliente, rdet.valor
       FROM recibos r
       JOIN recibo_detalles rdet ON r.id = rdet.recibo_id
       JOIN cotizaciones c ON c.id = rdet.cotizacion_id
       JOIN clientes cli ON cli.id = c.cliente_id
       WHERE DATE(r.fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    // Totales
    const totalCreditos = creditos.reduce((sum, c) => sum + Number(c.subtotal), 0);
    const totalContado = contado.reduce((sum, c) => sum + Number(c.subtotal), 0);
    const totalAbonos = abonos.reduce((sum, a) => sum + Number(a.valor), 0);

    // 4. Resumen
    const resumen = {
      totalCreditos,
      totalContado,
      totalAbonos,
      totalIngresos: totalContado + totalAbonos,
    };

    res.json({ creditos, contado, abonos, resumen });
  } catch (error) {
    console.error("Error en reporte ventas:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;