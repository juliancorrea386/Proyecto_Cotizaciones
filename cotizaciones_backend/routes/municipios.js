const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar todos los municipios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM municipios ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener municipios' });
  }
});

// Obtener municipio por id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM municipios WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Municipio no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener municipio' });
  }
});

module.exports = router;
