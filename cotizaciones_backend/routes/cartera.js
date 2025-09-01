const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener cartera de clientes
router.get("/", async (req, res) => {
    try {
        const { cedula, nombreCliente, desde, hasta, municipios } = req.query;
        let query = `
      SELECT 
          c.id AS cliente_id,
          c.nombre,
          c.municipio,
          co.id AS cotizacion_id,
          co.numero_cotizacion,
          co.total,
          co.saldo,
          co.fecha
      FROM clientes c
      INNER JOIN cotizaciones co ON c.id = co.cliente_id
      WHERE co.tipo = 'credito'
        AND co.saldo > 0
      
    `;
        const params = [];
        // Filtro por cedula de cliente
        if (cedula) {
            query += " AND c.id LIKE ? ";
            params.push(`%${cedula}%`);
        }

        // Filtro nombre de cliente
        if (nombreCliente) {
            query += " AND c.nombre LIKE ? ";
            params.push(`%${nombreCliente}%`);
        }

        // Filtro por rango de fechas
        if (desde && hasta) {
            query += " AND DATE(co.fecha) BETWEEN ? AND ? ";
            params.push(desde, hasta);
        }

        // Filtro por municipios (array)
        if (municipios) {
            const municipiosArray = municipios.split(",");
            query += ` AND c.municipio IN (${municipiosArray.map(() => "?").join(",")}) `;
            params.push(...municipiosArray);
        }

        query += " ORDER BY c.nombre, co.fecha ASC";
        const [rows] = await db.query(query, params);

        // Agrupar por cliente
        const cartera = rows.reduce((acc, row) => {
            const clienteId = row.cliente_id;
            if (!acc[clienteId]) {
                acc[clienteId] = {
                    id: clienteId,
                    nombre: row.nombre,
                    municipio: row.municipio,
                    cotizaciones: []
                };
            }
            acc[clienteId].cotizaciones.push({
                id: row.cotizacion_id,
                numero_cotizacion: row.numero_cotizacion,
                fecha: row.fecha,
                total: row.total,
                saldo: row.saldo
            });
            return acc;
        }, {});

        res.json(Object.values(cartera));
    } catch (err) {
        console.error("Error al obtener cartera:", err);
        res.status(500).json({ error: "Error al obtener la cartera" });
    }
});

module.exports = router;
