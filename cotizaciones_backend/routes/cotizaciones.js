const express = require('express');
const router = express.Router();
const pool = require('../db');

// Crear cotización
router.post('/', async (req, res) => {
    const { numero_cotizacion, fecha, cliente_id, tipo, productos } = req.body;

    try {
        // Calcular subtotal
        const subtotal = productos.reduce((acc, p) => acc + (p.precio_venta * p.cantidad), 0);

        // Insertar cotización
        const [cotizacionResult] = await pool.query(
            `INSERT INTO cotizaciones (numero_cotizacion, fecha, cliente_id, tipo, subtotal) 
             VALUES (?, ?, ?, ?, ?)`,
            [numero_cotizacion, fecha, cliente_id, tipo, subtotal]
        );

        const cotizacionId = cotizacionResult.insertId;

        // Insertar los productos de la cotización
        for (const p of productos) {
            await pool.query(
                `INSERT INTO cotizacion_detalles (cotizacion_id, producto_id, cantidad, precio_venta) 
                 VALUES (?, ?, ?, ?)`,
                [cotizacionId, p.id, p.cantidad, p.precio_venta]
            );
        }

        res.status(201).json({ message: "Cotización creada con éxito", id: cotizacionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener todas las cotizaciones (con opción de filtrar por fechas)
router.get('/', async (req, res) => {
    try {
        const { desde, hasta } = req.query;

        let query = `
            SELECT 
                c.id,
                c.numero_cotizacion,
                c.fecha,
                c.tipo,
                cli.nombre AS cliente,
                c.subtotal
            FROM cotizaciones c
            JOIN clientes cli ON c.cliente_id = cli.id
            WHERE 1=1
        `;
        const params = [];

        // Si se pasan fechas, agregamos condición
        if (desde && hasta) {
            query += " AND DATE(c.fecha) BETWEEN ? AND ? ";
            params.push(desde, hasta);
        }

        query += " ORDER BY c.id DESC";

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener cotizaciones:", error);
        res.status(500).json({ error: error.message });
    }
});


// Eliminar cotización
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Primero eliminar los detalles para evitar errores por FK
        await pool.query(`DELETE FROM cotizacion_detalles WHERE cotizacion_id = ?`, [id]);

        // Luego eliminar la cotización
        const [result] = await pool.query(`DELETE FROM cotizaciones WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }

        res.json({ message: "Cotización eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener cotización por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [cotizacion] = await pool.query(`SELECT * FROM cotizaciones WHERE id = ?`, [id]);
        const [productos] = await pool.query(`
            SELECT cd.*, p.nombre
            FROM cotizacion_detalles cd
            JOIN productos p ON cd.producto_id = p.id
            WHERE cotizacion_id = ?
        `, [id]);

        if (cotizacion.length === 0) return res.status(404).json({ error: "No encontrada" });

        res.json({
            ...cotizacion[0],
            productos
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar cotización
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { numero_cotizacion, fecha, cliente_id, tipo, productos } = req.body;

    try {
        const subtotal = productos.reduce((acc, p) => acc + (p.precio_venta * p.cantidad), 0);

        await pool.query(
            `UPDATE cotizaciones SET numero_cotizacion = ?, fecha = ?, cliente_id = ?, tipo = ?, subtotal = ? WHERE id = ?`,
            [numero_cotizacion, fecha, cliente_id, tipo, subtotal, id]
        );

        // Borrar productos anteriores
        await pool.query(`DELETE FROM cotizacion_detalles WHERE cotizacion_id = ?`, [id]);

        // Insertar productos nuevos
        for (const p of productos) {
            await pool.query(
                `INSERT INTO cotizacion_detalles (cotizacion_id, producto_id, cantidad, precio_venta) VALUES (?, ?, ?, ?)`,
                [id, p.producto_id || p.id, p.cantidad, p.precio_venta]
            );
        }

        res.json({ message: "Cotización actualizada con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
