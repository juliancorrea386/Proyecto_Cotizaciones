const express = require('express');
const router = express.Router();
const pool = require('../db');

// RUTA: /api/reportes/inventario
router.get('/inventario', async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        let query = `
            SELECT 
                p.id,
                p.nombre,
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


module.exports = router;