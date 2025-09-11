const express = require("express");
const router = express.Router();
const pool = require("../db"); // tu conexión mysql2/promise

router.get("/", async (req, res) => {
    try {
        const { desde, hasta, cliente, numero_cotizacion, numero_recibo } = req.query;

        let query = `
            SELECT 
                c.id AS cotizacion_id,
                c.numero_cotizacion,
                c.tipo,
                DATE_FORMAT(c.fecha, '%d-%m-%Y') AS fecha_cotizacion,
                cli.nombre AS cliente,
                c.subtotal,

                -- Si es contado, muestro un "abono virtual" = subtotal
                CASE 
                    WHEN c.tipo = 'contado' AND rdet.id IS NULL 
                    THEN c.numero_cotizacion
                    ELSE r.numero_recibo
                END AS recibo_id,

                CASE 
                    WHEN c.tipo = 'contado' AND rdet.id IS NULL 
                    THEN DATE_FORMAT(c.fecha, '%d-%m-%Y')
                    ELSE DATE_FORMAT(r.fecha, '%d-%m-%Y')
                END AS fecha_abono,

                CASE 
                    WHEN c.tipo = 'contado' AND rdet.id IS NULL 
                    THEN c.subtotal
                    ELSE rdet.valor
                END AS valor_abono,

                -- Saldo
                CASE 
        WHEN c.tipo = 'contado' THEN 0
        ELSE (
        c.subtotal - IFNULL(
            (
                SELECT SUM(r2.valor)
                FROM recibo_detalles r2
                JOIN recibos rr2 ON rr2.id = r2.recibo_id
                WHERE r2.cotizacion_id = c.id
                  AND rr2.fecha <= r.fecha  -- solo sumo lo abonado hasta ese recibo
            ), 
                0
            )
        )
        END AS saldo

            FROM cotizaciones c
            JOIN clientes cli ON cli.id = c.cliente_id
            LEFT JOIN recibo_detalles rdet ON rdet.cotizacion_id = c.id
            LEFT JOIN recibos r ON r.id = rdet.recibo_id
            WHERE 1=1
        `;

        const params = [];

        if (desde && hasta) {
            query += " AND DATE(c.fecha) BETWEEN ? AND ? ";
            params.push(desde, hasta);
        }

        if (cliente) {
            query += " AND cli.nombre LIKE ? ";
            params.push(`%${cliente}%`);
        }

        // Filtro por número de cotización
        if (numero_cotizacion) {
            query += " AND c.numero_cotizacion LIKE ? ";
            params.push(`%${numero_cotizacion}%`);
        }

        // Filtro por número de recibo
        if (numero_recibo) {
            query += " AND r.numero_recibo LIKE ? ";
            params.push(`%${numero_recibo}%`);
        }
        
        query += ` ORDER BY c.fecha ASC, r.fecha, c.numero_cotizacion ASC`;
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener movimientos:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
