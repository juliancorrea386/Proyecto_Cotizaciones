const express = require('express');
const router = express.Router();
const pool = require('../db');
const PDFDocument = require("pdfkit");
require("pdfkit-table");


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

router.get("/ReporteVentas", async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        if (!desde || !hasta) {
            return res.status(400).json({ error: "Se requieren las fechas desde y hasta" });
        }

        // 1. Cotizaciones a crédito
        const [creditos] = await pool.query(
            `SELECT c.id, c.numero_cotizacion, c.fecha, cli.nombre AS cliente, c.subtotal
       FROM cotizaciones c
       JOIN clientes cli ON cli.id = c.cliente_id
       WHERE c.tipo = 'credito' 
         AND DATE(c.fecha) BETWEEN ? AND ?`,
            [desde, hasta]
        );

        // 2. Ventas de contado
        const [contado] = await pool.query(
            `SELECT c.id, c.numero_cotizacion, c.fecha, cli.nombre AS cliente, c.subtotal
       FROM cotizaciones c
       JOIN clientes cli ON cli.id = c.cliente_id
       WHERE c.tipo = 'contado' 
         AND DATE(c.fecha) BETWEEN ? AND ?`,
            [desde, hasta]
        );

        // 3. Abonos realizados en el rango
        const [abonos] = await pool.query(
            `SELECT r.numero_recibo, r.fecha, cli.nombre AS cliente, rdet.valor
       FROM recibos r
       JOIN recibo_detalles rdet ON r.id = rdet.recibo_id
       JOIN cotizaciones c ON c.id = rdet.cotizacion_id
       JOIN clientes cli ON cli.id = c.cliente_id
       WHERE DATE(r.fecha) BETWEEN ? AND ?`,
            [desde, hasta]
        );

        // Totales
        const totalCreditos = creditos.reduce((sum, c) => sum + Number(c.subtotal), 0);
        const totalContado = contado.reduce((sum, c) => sum + Number(c.subtotal), 0);
        const totalAbonos = abonos.reduce((sum, a) => sum + Number(a.valor), 0);

        // 4. Resumen
        const resumen = {
            totalCreditos,
            totalContado,
            totalAbonos,
            totalIngresos: totalContado + totalAbonos,
        };

        res.json({ creditos, contado, abonos, resumen });
    } catch (error) {
        console.error("Error en reporte ventas:", error);
        res.status(500).json({ error: error.message });
    }
});


router.get("/reporte-ventas/pdf", async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    const [creditos] = await pool.query(
      `SELECT c.numero_cotizacion, cli.nombre AS cliente, c.subtotal
       FROM cotizaciones c
       JOIN clientes cli ON cli.id = c.cliente_id
       WHERE c.tipo = 'credito' AND DATE(c.fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    const [contado] = await pool.query(
      `SELECT c.numero_cotizacion, cli.nombre AS cliente, c.subtotal
       FROM cotizaciones c
       JOIN clientes cli ON cli.id = c.cliente_id
       WHERE c.tipo = 'contado' AND DATE(c.fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    const [abonos] = await pool.query(
      `SELECT r.numero_recibo, cli.nombre AS cliente, rdet.valor
       FROM recibos r
       JOIN recibo_detalles rdet ON r.id = rdet.recibo_id
       JOIN cotizaciones c ON c.id = rdet.cotizacion_id
       JOIN clientes cli ON cli.id = c.cliente_id
       WHERE DATE(r.fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    const totalCreditos = creditos.reduce((s, c) => s + Number(c.subtotal), 0);
    const totalContado = contado.reduce((s, c) => s + Number(c.subtotal), 0);
    const totalAbonos = abonos.reduce((s, a) => s + Number(a.valor), 0);
    const totalIngresos = totalContado + totalAbonos;

    // --- PDF ---
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=reporte_ventas.pdf");
    doc.pipe(res);

    // --- Título ---
    doc.font("Helvetica-Bold").fontSize(22).text("Reporte de Ventas", { align: "center" });
    doc.moveDown(2);

    // --- Función auxiliar ---
    const drawTable = async (title, headers, rows, totalLabel, totalValue) => {
      doc.font("Helvetica-Bold").fontSize(14).text(title, { align: "left" });
      doc.moveDown(0.5);

      const table = {
        headers,
        rows,
      };

      await doc.table(table, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
        prepareRow: (row, i) => doc.font("Helvetica").fontSize(11),
        columnSpacing: 10,
        width: 500,
      });

      if (totalLabel) {
        doc.moveDown(0.5);
        doc.font("Helvetica-Bold").fillColor("blue").text(`${totalLabel}: $${totalValue.toLocaleString()}`);
        doc.fillColor("black");
        doc.moveDown(1);
      }
    };

    // --- Secciones ---
    await drawTable(
      "Cotizaciones a Crédito",
      ["N° Cotización", "Cliente", "Subtotal"],
      creditos.map(c => [c.numero_cotizacion, c.cliente, `$${c.subtotal.toLocaleString()}`]),
      "Total Créditos",
      totalCreditos
    );

    await drawTable(
      "Ventas de Contado",
      ["N° Cotización", "Cliente", "Subtotal"],
      contado.map(c => [c.numero_cotizacion, c.cliente, `$${c.subtotal.toLocaleString()}`]),
      "Total Contado",
      totalContado
    );

    await drawTable(
      "Abonos Realizados",
      ["N° Recibo", "Cliente", "Valor"],
      abonos.map(a => [a.numero_recibo, a.cliente, `$${a.valor.toLocaleString()}`]),
      "Total Abonos",
      totalAbonos
    );

    // --- Resumen ---
    const resumenTable = {
      headers: ["Concepto", "Monto"],
      rows: [
        ["Créditos generados", `$${totalCreditos.toLocaleString()}`],
        ["Ingresos por contado", `$${totalContado.toLocaleString()}`],
        ["Ingresos por abonos", `$${totalAbonos.toLocaleString()}`],
        ["Total Ingresos", `$${totalIngresos.toLocaleString()}`],
      ],
    };

    await doc.table(resumenTable, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(13),
      prepareRow: (row, i) =>
        i === 3
          ? doc.font("Helvetica-Bold").fillColor("green").fontSize(12)
          : doc.font("Helvetica").fillColor("black").fontSize(12),
      columnSpacing: 10,
      width: 500,
    });

    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;