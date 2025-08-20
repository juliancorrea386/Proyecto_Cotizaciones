const express = require("express");
const router = express.Router();
const db = require("../db");

// POST: Registrar un recibo con varios abonos
router.post("/", async (req, res) => {
  const { numero_recibo, fecha, observacion, abonos, cliente_id } = req.body;
  // abonos = [{ cotizacion_id: 1, valor: 50000 }, { cotizacion_id: 2, valor: 30000 }]
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Insertar recibo
    const [reciboResult] = await connection.query(
      "INSERT INTO recibos (numero_recibo, fecha, observacion, cliente_id) VALUES (?, ?, ?, ?)",
      [numero_recibo, fecha, observacion || null, cliente_id]
    );
    const reciboId = reciboResult.insertId;

    // Insertar cada abono
    for (let abono of abonos) {
      await connection.query(
        "INSERT INTO recibo_detalles (recibo_id, cotizacion_id, valor) VALUES (?, ?, ?)",
        [reciboId, abono.cotizacion_id, abono.valor]
      );

      // Actualizar saldo de la cotización
      await connection.query(
        "UPDATE cotizaciones SET saldo = saldo - ? WHERE id = ?",
        [abono.valor, abono.cotizacion_id]
      );
    }

    await connection.commit();
    res.json({ message: "✅ Recibo registrado con éxito", reciboId });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Error al registrar recibo" });
  } finally {
    connection.release();
  }
});


router.get('/Numero', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT MAX(numero_recibo) AS mayor_numero FROM recibos;'
    );
    res.json(rows[0]); // 👈 devuelve solo el objeto, no el array
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET: Listar recibos con cliente y total abonado
router.get("/", async (req, res) => {
  try {
    const { desde, hasta, cliente, numero } = req.query;
    let query = `
      SELECT r.id, r.numero_recibo, r.fecha, r.observacion,
             c.cliente_id,
             cl.nombre AS cliente_nombre,
             COALESCE(SUM(rd.valor), 0) AS total_abonos
      FROM recibos r
      LEFT JOIN recibo_detalles rd ON r.id = rd.recibo_id
      LEFT JOIN cotizaciones c ON rd.cotizacion_id = c.id
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      WHERE 1=1
    `;

    const params = [];

    // Filtro por rango de fechas
    if (desde && hasta) {
      query += " AND DATE(r.fecha) BETWEEN ? AND ? ";
      params.push(desde, hasta);
    }

    // Filtro por cliente (opcional)
    if (cliente) {
      query += " AND (cl.nombre LIKE ? OR c.cliente_id = ?) ";
      params.push(`%${cliente}%`, cliente);
    }

    // Filtro por número de recibo (opcional)
    if (numero) {
      query += " AND r.numero_recibo LIKE ? ";
      params.push(`%${numero}%`);
    }

    query += `
      GROUP BY r.id, r.numero_recibo, r.fecha, r.observacion, c.cliente_id, cl.nombre
      ORDER BY r.numero_recibo ASC
    `;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar recibos" });
  }
});


module.exports = router;