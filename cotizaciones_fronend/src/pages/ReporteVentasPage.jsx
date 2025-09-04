import React, { useState } from "react";
import reportesService from "../services/reportesService";
import jsPDF from "jspdf";
import "jspdf-autotable";
export default function ReporteVentasPage() {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [data, setData] = useState(null);

    const fetchReporte = async (params = { desde, hasta }) => {
        try {
            const res = await reportesService.getReporteVenta(params);
            setData(res);
        } catch (error) {
            console.error("Error cargando reporte:", error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchReporte();
    };
    // 👉 Generar PDF
    const exportarPDF = () => {
        if (!data) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(16);
        doc.text("Reporte de Ventas", pageWidth / 2, 15, { align: "center" });

        // 👉 Fechas del filtro
        doc.setFontSize(11);
        doc.text(
            `Período: ${desde || "..."} - ${hasta || "..."}`,
            pageWidth / 2,
            23,
            { align: "center" }
        );

        // --- Créditos ---
        doc.setFontSize(13);
        doc.text("Cotizaciones a Crédito", 14, 30);
        doc.autoTable({
            startY: 35,
            head: [["N° Cotización", "Cliente", "Subtotal"]],
            body: data.creditos.map((c) => [
                c.numero_cotizacion,
                c.cliente,
                new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                }).format(c.subtotal),
            ]),
            foot: [
                [
                    { content: "Total Créditos", colSpan: 2, styles: { halign: "right" } },
                    new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                    }).format(data.resumen.totalCreditos),
                ],
            ],
            theme: "grid",
        });

        // --- Contado ---
        doc.setFontSize(13);
        doc.text("Ventas de Contado", 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [["N° Cotización", "Cliente", "Subtotal"]],
            body: data.contado.map((c) => [
                c.numero_cotizacion,
                c.cliente,
                new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                }).format(c.subtotal),
            ]),
            foot: [
                [
                    { content: "Total Contado", colSpan: 2, styles: { halign: "right" } },
                    new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                    }).format(data.resumen.totalContado),
                ],
            ],
            theme: "grid",
        });

        // --- Abonos ---
        doc.setFontSize(13);
        doc.text("Abonos Realizados", 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [["N° Recibo", "Cliente", "Valor"]],
            body: data.abonos.map((a) => [
                a.numero_recibo,
                a.cliente,
                new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                }).format(a.valor),
            ]),
            foot: [
                [
                    { content: "Total Abonos", colSpan: 2, styles: { halign: "right" } },
                    new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                    }).format(data.resumen.totalAbonos),
                ],
            ],
            theme: "grid",
        });

        // --- Resumen General ---
        doc.setFontSize(14);
        doc.text("Resumen General", 14, doc.lastAutoTable.finalY + 15);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [["Concepto", "Valor"]],
            body: [
                ["Cotizaciones a Crédito", new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(data.resumen.totalCreditos)],
                ["Ventas de Contado", new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(data.resumen.totalContado)],
                ["Ingresos por Abonos", new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(data.resumen.totalAbonos)],
                ["Total Ingresos", new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(data.resumen.totalIngresos)],
            ],
            theme: "grid",
        });

        doc.save("reporte_ventas.pdf");
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">📈 Reporte de Ventas</h1>

            {/* Filtros */}
            <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
                <div>
                    <label className="block">Desde</label>
                    <input
                        type="date"
                        value={desde}
                        onChange={(e) => setDesde(e.target.value)}
                        className="border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block">Hasta</label>
                    <input
                        type="date"
                        value={hasta}
                        onChange={(e) => setHasta(e.target.value)}
                        className="border rounded px-2 py-1"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Generar
                </button>
                <button
                    type="button"
                    onClick={exportarPDF}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition"
                >
                    📄 Exportar PDF
                </button>
            </form>

            {data && (
                <div className="space-y-6">
                    {/* Créditos */}
                    <div className="bg-white shadow rounded p-4">
                        <h2 className="font-bold text-lg mb-2">📝 Cotizaciones a Crédito</h2>
                        <table className="w-full border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-2 py-1">N° Cotización</th>
                                    <th className="border px-2 py-1">Cliente</th>
                                    <th className="border px-2 py-1">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.creditos.map((c) => (
                                    <tr key={c.id}>
                                        <td className="border px-2 py-1">{c.numero_cotizacion}</td>
                                        <td className="border px-2 py-1">{c.cliente}</td>
                                        <td className="border px-2 py-1 text-right">
                                            ${Number(c.subtotal).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td colSpan="2" className="px-2 py-1 text-right">
                                        Total Créditos:
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        ${Number(data.resumen.totalCreditos).toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Contado */}
                    <div className="bg-white shadow rounded p-4">
                        <h2 className="font-bold text-lg mb-2">💵 Ventas de Contado</h2>
                        <table className="w-full border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-2 py-1">N° Cotización</th>
                                    <th className="border px-2 py-1">Cliente</th>
                                    <th className="border px-2 py-1">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.contado.map((c) => (
                                    <tr key={c.id}>
                                        <td className="border px-2 py-1">{c.numero_cotizacion}</td>
                                        <td className="border px-2 py-1">{c.cliente}</td>
                                        <td className="border px-2 py-1 text-right">
                                            ${Number(c.subtotal).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td colSpan="2" className="px-2 py-1 text-right">
                                        Total Contado:
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        ${Number(data.resumen.totalContado).toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Abonos */}
                    <div className="bg-white shadow rounded p-4">
                        <h2 className="font-bold text-lg mb-2">📥 Abonos Realizados</h2>
                        <table className="w-full border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-2 py-1">N° Recibo</th>
                                    <th className="border px-2 py-1">Cliente</th>
                                    <th className="border px-2 py-1">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.abonos.map((a, i) => (
                                    <tr key={i}>
                                        <td className="border px-2 py-1">{a.numero_recibo}</td>
                                        <td className="border px-2 py-1">{a.cliente}</td>
                                        <td className="border px-2 py-1 text-right">
                                            ${Number(a.valor).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td colSpan="2" className="px-2 py-1 text-right">
                                        Total Abonos:
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        ${Number(data.resumen.totalAbonos).toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Resumen General */}
                    <div className="bg-green-100 shadow rounded p-4">
                        <h2 className="font-bold text-lg mb-2">📊 Resumen</h2>
                        <p>Créditos generados: ${Number(data.resumen.totalCreditos).toLocaleString()}</p>
                        <p>Ingresos por contado: ${Number(data.resumen.totalContado).toLocaleString()}</p>
                        <p>Ingresos por abonos: ${Number(data.resumen.totalAbonos).toLocaleString()}</p>
                        <p className="text-xl font-bold mt-2">
                            💰 Total Ingresos: ${Number(data.resumen.totalIngresos).toLocaleString()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
