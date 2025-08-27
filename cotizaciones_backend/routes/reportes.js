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
                p.referencia,
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
    if (!desde || !hasta) {
      return res.status(400).json({ error: "Fechas desde y hasta son requeridas" });
    }

    // --- Consultas SQL ---
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

    // --- Totales ---
    const totalCreditos = creditos.reduce((s, c) => s + Number(c.subtotal), 0);
    const totalContado = contado.reduce((s, c) => s + Number(c.subtotal), 0);
    const totalAbonos = abonos.reduce((s, a) => s + Number(a.valor), 0);
    const totalIngresos = totalContado + totalAbonos;

    // --- PDF ---
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=reporte_ventas.pdf");
    doc.pipe(res);

    const money = n => `$${Number(n).toLocaleString("es-CO")}`;

    // --- Función para dibujar tablas ---
    const drawTable = (title, headers, rows, totalLabel, totalValue, highlightColor = "blue") => {
      const left = doc.page.margins.left;
      const bottom = doc.page.height - doc.page.margins.bottom;

      // Reiniciar alineación al margen izquierdo
      doc.x = left;
      doc.font("Helvetica-Bold").fontSize(14).fillColor("black").text(title, left, doc.y);
      doc.moveDown(0.5);

      const startX = left;
      let startY = doc.y;
      const columnWidths = [150, 250, 100];
      const rowHeight = 25;

      const drawHeaders = () => {
        headers.forEach((header, i) => {
          const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.rect(x, startY, columnWidths[i], rowHeight).fill("#eeeeee").stroke();
          doc.fillColor("black").font("Helvetica-Bold").fontSize(12).text(header, x + 5, startY + 7);
        });
        startY += rowHeight;
      };

      // Validar espacio antes de imprimir encabezados
      if (startY + rowHeight * 2 > bottom) {
        doc.addPage();
        startY = doc.y;
      }

      drawHeaders();

      // Filas
      rows.forEach(row => {
        if (startY + rowHeight > bottom) {
          doc.addPage();
          startY = doc.y;
          drawHeaders(); // Redibujar encabezados en nueva página
        }

        row.forEach((cell, i) => {
          const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.rect(x, startY, columnWidths[i], rowHeight).stroke();
          doc.font("Helvetica").fontSize(11).fillColor("black").text(cell, x + 5, startY + 7);
        });
        startY += rowHeight;
      });

      doc.y = startY + 10;
      doc.font("Helvetica-Bold").fillColor(highlightColor).text(`${totalLabel}: ${money(totalValue)}`, startX, doc.y);
      doc.fillColor("black").moveDown(2);
    };

    // --- Contenido ---
    doc.fontSize(20).text("Reporte de Ventas", { align: "center" });
    doc.moveDown(0);

    // Fechas del filtro
    doc.fontSize(12).font("Helvetica")
      .text(`Desde: ${desde}    Hasta: ${hasta}`, { align: "center" });
    doc.moveDown(1);

    drawTable(
      "Ventas a Crédito",
      ["N° Cotización", "Cliente", "Subtotal"],
      creditos.map(c => [c.numero_cotizacion, c.cliente, money(c.subtotal)]),
      "Total Créditos",
      totalCreditos
    );

    drawTable(
      "Ventas de Contado",
      ["N° Cotización", "Cliente", "Subtotal"],
      contado.map(c => [c.numero_cotizacion, c.cliente, money(c.subtotal)]),
      "Total Contado",
      totalContado
    );

    drawTable(
      "Abonos Realizados",
      ["N° Recibo", "Cliente", "Valor"],
      abonos.map(a => [a.numero_recibo, a.cliente, money(a.valor)]),
      "Total Abonos",
      totalAbonos
    );

    // --- Resumen ---
    doc.fontSize(14).font("Helvetica-Bold").fillColor("black")
      .text("Resumen", doc.page.margins.left, doc.y);
    doc.moveDown(0.5);

    const startX = doc.page.margins.left;
    let startY = doc.y;
    const resumenWidths = [250, 150];
    const resumenHeight = 25;
    const resumenHeaders = ["Concepto", "Monto"];
    const resumenRows = [
      ["Créditos generados", money(totalCreditos)],
      ["Ingresos por contado", money(totalContado)],
      ["Ingresos por abonos", money(totalAbonos)],
      ["Total Ingresos", money(totalIngresos)]
    ];

    resumenHeaders.forEach((header, i) => {
      const x = startX + resumenWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.rect(x, startY, resumenWidths[i], resumenHeight).fill("#dddddd").stroke();
      doc.fillColor("black").font("Helvetica-Bold").fontSize(12).text(header, x + 5, startY + 7);
    });
    startY += resumenHeight;

    resumenRows.forEach((row, i) => {
      row.forEach((cell, j) => {
        const x = startX + resumenWidths.slice(0, j).reduce((a, b) => a + b, 0);
        doc.rect(x, startY, resumenWidths[j], resumenHeight).stroke();
        const font = i === 3 ? "Helvetica-Bold" : "Helvetica";
        const color = i === 3 ? "green" : "black";
        doc.font(font).fontSize(11).fillColor(color).text(cell, x + 5, startY + 7);
      });
      startY += resumenHeight;
    });

    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;