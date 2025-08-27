const express = require('express');
const router = express.Router();
const pool = require('../db');
const { ref } = require('pdfkit');

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear producto
router.post('/', async (req, res) => {
    const { nombre, precio_costo, precio_venta, iva, embalaje, stock, referencia } = req.body;

    if (!nombre || precio_costo == null || precio_venta == null || !iva || !embalaje || stock == null) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO productos (nombre, precio_costo, precio_venta, iva, embalaje, stock, Referencia) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, precio_costo, precio_venta, iva, embalaje, stock, referencia]
        );
        res.status(201).json({ id: result.insertId, nombre, precio_costo, precio_venta, iva, embalaje, stock, referencia });
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: error.message });
    }
});


// Actualizar producto
router.put('/:id', async (req, res) => {
    const { nombre, precio_costo, precio_venta, iva, embalaje, stock, Referencia } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE productos SET nombre=?, precio_costo=?, precio_venta=?, iva=?, embalaje=?, stock=?, Referencia=?  WHERE id=?',
            [nombre, precio_costo, precio_venta, iva, embalaje, stock,Referencia, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ id: req.params.id, nombre, precio_costo, precio_venta, iva, embalaje, stock, Referencia });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
