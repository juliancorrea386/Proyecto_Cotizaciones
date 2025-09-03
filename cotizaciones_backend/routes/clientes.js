const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar clientes
router.get('/', async (req, res) => {
  try {
    const { cedula, nombreCliente } = req.query;

    let query = `
      SELECT 
        c.id, 
        c.nombre, 
        c.telefono, 
        c.municipio_id,
        m.nombre AS municipio,
        c.created_at, 
        c.updated_at 
      FROM clientes c
      LEFT JOIN municipios m ON c.municipio_id = m.id
      WHERE 1=1
    `;

    const params = [];

    if (cedula) {
      query += " AND c.id LIKE ? ";
      params.push(`%${cedula}%`);
    }

    if (nombreCliente) {
      query += " AND c.nombre LIKE ? ";
      params.push(`%${nombreCliente}%`);
    }

    query += " ORDER BY c.nombre ASC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.nombre, c.telefono, c.municipio_id, m.nombre AS municipio
       FROM clientes c
       LEFT JOIN municipios m ON c.municipio_id = m.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el cliente' });
  }
});

// Crear cliente
router.post('/', async (req, res) => {
  try {
    const { id, nombre, telefono = null, municipio = null } = req.body;
    if (!id || !nombre) return res.status(400).json({ message: 'id y nombre son requeridos' });

    const [exists] = await pool.query('SELECT id FROM clientes WHERE id = ?', [id]);
    if (exists.length > 0) return res.status(409).json({ message: 'Cliente con esa cédula ya existe' });

    await pool.query(
      'INSERT INTO clientes (id, nombre, telefono, municipio_id) VALUES (?, ?, ?, ?)',
      [id, nombre, telefono, municipio]
    );

    res.status(201).json({ id, nombre, telefono, municipio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { nombre, telefono = null, municipio = null } = req.body;
    if (!nombre) return res.status(400).json({ message: 'nombre es requerido' });

    const [result] = await pool.query(
      'UPDATE clientes SET nombre = ?, telefono = ?, municipio_id = ? WHERE id = ?',
      [nombre, telefono, municipio, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado' });

    res.json({ id: req.params.id, nombre, telefono, municipio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
});

module.exports = router;
