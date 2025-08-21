const express = require("express");
const router = express.Router();
const db = require("../db");

const PDFDocument = require("pdfkit");
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
            r.cliente_id,
            cl.nombre AS cliente_nombre,
            COALESCE(SUM(rd.valor), 0) AS total_abonos
      FROM recibos r
      LEFT JOIN recibo_detalles rd ON r.id = rd.recibo_id
      LEFT JOIN cotizaciones c ON rd.cotizacion_id = c.id
      LEFT JOIN clientes cl ON r.cliente_id = cl.id
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
      GROUP BY r.id, r.numero_recibo, r.fecha, r.observacion, r.cliente_id, cl.nombre
      ORDER BY r.numero_recibo ASC
    `;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar recibos" });
  }
});

// PUT: Editar recibo con detalles
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fecha, observacion, cliente_id, detalles } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 1. Actualizar cabecera del recibo
    const [result] = await conn.query(
      `UPDATE recibos 
       SET fecha = ?, observacion = ? 
       WHERE id = ?`,
      [fecha, observacion, id]
    );

    // 2. Actualizar detalles solo si vienen en el body
    if (detalles && detalles.length > 0) {
      await conn.query(`DELETE FROM recibo_detalles WHERE recibo_id = ?`, [id]);

      for (const d of detalles) {

        await conn.query(
          `INSERT INTO recibo_detalles (recibo_id, cotizacion_id, valor) 
           VALUES (?, ?, ?)`,
          [id, d.cotizacion_id, d.valor]
        );

        await conn.query(
          `UPDATE cotizaciones c
           SET c.saldo = c.subtotal - IFNULL((
             SELECT SUM(valor) FROM recibo_detalles WHERE cotizacion_id = c.id
           ), 0)
           WHERE c.id = ?`,
          [d.cotizacion_id]
        );
      }
    } else {
      console.log("⚠️ No llegaron detalles, no se modifican los recibo_detalles");
    }

    await conn.commit();
    res.json({ message: "Recibo actualizado correctamente" });

  } catch (err) {
    await conn.rollback();
    console.error("❌ Error en PUT /recibos/:id:", err);
    res.status(500).json({ error: "Error al actualizar recibo" });
  } finally {
    conn.release();
  }
});



// GET /api/recibos/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Datos principales del recibo
    const [recibo] = await db.query(
      `SELECT r.id, r.numero_recibo, r.fecha, r.observacion,
              cl.id AS cliente_id, cl.nombre AS cliente_nombre
       FROM recibos r
       LEFT JOIN recibo_detalles rd ON r.id = rd.recibo_id
       LEFT JOIN cotizaciones c ON rd.cotizacion_id = c.id
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       WHERE r.id = ?`,
      [id]
    );

    if (recibo.length === 0) {
      return res.status(404).json({ message: "Recibo no encontrado" });
    }

    // Traer abonos relacionados
    const [abonos] = await db.query(
      `SELECT rd.id, rd.cotizacion_id, rd.valor,
              c.numero_cotizacion, c.total, c.fecha AS fecha_abono, c.saldo
       FROM recibo_detalles rd
       LEFT JOIN cotizaciones c ON rd.cotizacion_id = c.id
       WHERE rd.recibo_id = ?`,
      [id]
    );

    res.json({
      ...recibo[0],
      abonos,
    });
  } catch (err) {
    console.error("Error GET /api/recibos/:id:", err);
    res.status(500).json({ error: "Error al obtener el recibo" });
  }
});

router.get("/:id/pdf", async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await db.getConnection();

    // 🔹 Traer datos del recibo + cliente
    const [recibos] = await conn.query(
      `SELECT r.id, r.numero_recibo, r.fecha, r.cliente_id, c.nombre AS cliente_nombre,
              (SELECT SUM(valor) FROM recibo_detalles WHERE recibo_id = r.id) AS total_abonos
       FROM recibos r
       JOIN clientes c ON c.id = r.cliente_id
       WHERE r.id = ?`,
      [id]
    );

    if (recibos.length === 0) {
      return res.status(404).send("Recibo no encontrado");
    }
    const recibo = recibos[0];

    // 🔹 Cotizaciones abonadas
    const [detalles] = await conn.query(
      `SELECT d.cotizacion_id, c.numero_cotizacion, d.valor AS monto
      FROM recibo_detalles d
      JOIN cotizaciones c ON c.id = d.cotizacion_id
      WHERE d.recibo_id = ?`,
      [id]
    );

    conn.release();

    // 📄 Crear PDF elegante
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=recibo_${recibo.numero_recibo}.pdf`
    );
    doc.pipe(res);

    // -------------------------------
    // ENCABEZADO
    // -------------------------------
    doc
      .fontSize(20)
      .fillColor("#004080")
      .text("RECIBO DE PAGO", { align: "center" })
      .moveDown(1);

    // Datos principales en cuadro
    doc
      .rect(40, doc.y, 520, 80)
      .stroke("#004080");

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Número de Recibo: ${recibo.numero_recibo}`, 50, doc.y + 10)
      .text(
        `Fecha: ${new Date(recibo.fecha).toLocaleDateString("es-CO")}`,
        50,
        doc.y + 20
      )
      .text(
        `Cliente: ${recibo.cliente_nombre} (${recibo.cliente_id})`,
        50,
        doc.y + 30
      );

    doc.moveDown(3);

    // -------------------------------
    // TABLA DE COTIZACIONES
    // -------------------------------
    doc.fontSize(14).fillColor("#004080").text("Detalle de Abonos", {
      underline: true,
    });
    doc.moveDown(0.5);

    // Encabezado tabla
    const startX = 50;
    let posY = doc.y;

    // Dibujar fondo azul
    doc
      .rect(startX, posY, 200, 20)
      .fill("#004080");

    doc
      .rect(startX + 200, posY, 200, 20)
      .fill("#004080");

    // Poner texto en blanco encima
    doc
      .fillColor("white")
      .fontSize(12)
      .text("N° Cotización", startX + 5, posY + 5);

    doc
      .text("Valor", startX + 205, posY + 5);

    posY += 25;
    doc.fillColor("black"); // ← vuelve a negro para el contenido normal
    detalles.forEach((d, index) => {
      const bgColor = index % 2 === 0 ? "#F5F5F5" : "white";
      doc.rect(startX, posY, 200, 20).fill(bgColor);
      doc.rect(startX + 200, posY, 200, 20).fill(bgColor);

      doc
        .fillColor("black")
        .text(`#${d.numero_cotizacion}`, startX + 5, posY + 5)
        .text(
          new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }).format(d.monto),
          startX + 205,
          posY + 5
        );
      posY += 20;
    });

    // -------------------------------
    // TOTAL
    // -------------------------------
    doc.moveDown(2);
    doc
      .fontSize(14)
      .fillColor("black")
      .text(
        `Total abonado: ${new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(recibo.total_abonos || 0)}`,
        { align: "right" }
      );

    // -------------------------------
    // FIRMA
    // -------------------------------
    doc.moveDown(4);
    doc
      .fontSize(12)
      .text("_________________________", { align: "center" })
      .text("Firma y sello", { align: "center" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando PDF");
  }
});



module.exports = router;