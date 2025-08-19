const express = require("express");
const router = express.Router();
const db = require("../db");

// POST: Registrar un recibo con varios abonos
router.post("/", async (req, res) => {
  const { observacion, abonos } = req.body;
  // abonos = [{ cotizacion_id: 1, valor: 50000 }, { cotizacion_id: 2, valor: 30000 }]
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insertar recibo
    const [reciboResult] = await connection.query(
      "INSERT INTO recibos (fecha, observacion) VALUES (CURDATE(), ?)",
      [observacion || null]
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




// GET: Consultar recibos con sus detalles
router.get("/", async (req, res) => {
  try {
    const [recibos] = await db.query("SELECT * FROM recibos ORDER BY fecha DESC");
    for (let recibo of recibos) {
      const [detalles] = await db.query(
        `SELECT d.*, c.numero_cotizacion 
         FROM recibo_detalles d 
         JOIN cotizaciones c ON d.cotizacion_id = c.id 
         WHERE d.recibo_id = ?`,
        [recibo.id]
      );
      recibo.detalles = detalles;
    }
    res.json(recibos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener recibos" });
  }
});

module.exports = router;