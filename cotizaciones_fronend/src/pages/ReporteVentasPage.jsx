import React, { useState } from "react";
import reportesService from "../services/reportesService";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ReporteVentasPage() {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tabActiva, setTabActiva] = useState("creditos");

    const fetchReporte = async () => {
        if (!desde || !hasta) {
            alert("Selecciona un rango de fechas");
            return;
        }
        setLoading(true);
        try {
            const res = await reportesService.getReporteVenta({ desde, hasta });
            setData(res);
            setTabActiva("creditos");
        } catch (error) {
            console.error("Error cargando reporte:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCOP = (value) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(Number(value) || 0);

    const exportarPDF = () => {
        if (!data) return;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(16);
        doc.text("Reporte de Ventas", pageWidth / 2, 15, { align: "center" });
        doc.setFontSize(11);
        doc.text(`Período: ${desde} - ${hasta}`, pageWidth / 2, 23, { align: "center" });

        doc.setFontSize(13);
        doc.text("Cotizaciones a Crédito", 14, 30);
        doc.autoTable({
            startY: 35,
            head: [["N° Cotización", "Cliente", "Subtotal"]],
            body: data.creditos.map((c) => [c.numero_cotizacion, c.cliente, formatCOP(c.subtotal)]),
            foot: [[{ content: "Total Créditos", colSpan: 2, styles: { halign: "right" } }, formatCOP(data.resumen.totalCreditos)]],
            theme: "grid",
        });

        doc.setFontSize(13);
        doc.text("Ventas de Contado", 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [["N° Cotización", "Cliente", "Subtotal"]],
            body: data.contado.map((c) => [c.numero_cotizacion, c.cliente, formatCOP(c.subtotal)]),
            foot: [[{ content: "Total Contado", colSpan: 2, styles: { halign: "right" } }, formatCOP(data.resumen.totalContado)]],
            theme: "grid",
        });

        doc.setFontSize(13);
        doc.text("Abonos Realizados", 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [["N° Recibo", "Cliente", "Valor"]],
            body: data.abonos.map((a) => [a.numero_recibo, a.cliente, formatCOP(a.valor)]),
            foot: [[{ content: "Total Abonos", colSpan: 2, styles: { halign: "right" } }, formatCOP(data.resumen.totalAbonos)]],
            theme: "grid",
        });

        doc.setFontSize(14);
        doc.text("Resumen General", 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [["Concepto", "Valor"]],
            body: [
                ["Cotizaciones a Crédito", formatCOP(data.resumen.totalCreditos)],
                ["Ventas de Contado", formatCOP(data.resumen.totalContado)],
                ["Ingresos por Abonos", formatCOP(data.resumen.totalAbonos)],
                ["Total Ingresos", formatCOP(data.resumen.totalIngresos)],
            ],
            theme: "grid",
        });

        doc.save("reporte_ventas.pdf");
    };

    const tabs = [
        { key: "creditos", label: "📝 Créditos", count: data?.creditos?.length },
        { key: "contado", label: "💵 Contado", count: data?.contado?.length },
        { key: "abonos", label: "📥 Abonos", count: data?.abonos?.length },
        { key: "resumen", label: "📊 Resumen" },
    ];

    return (
        <div className="mt-4 max-w-5xl mx-auto">
            <h1 className="text-lg md:text-2xl font-bold mb-4">📈 Reporte de Ventas</h1>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                        <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-400" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchReporte} disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        {loading ? "Generando..." : "📊 Generar"}
                    </button>
                    {data && (
                        <button onClick={exportarPDF}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                            📄 Exportar PDF
                        </button>
                    )}
                </div>
            </div>

            {/* Resultados */}
            {data && (
                <>
                    {/* Tarjetas resumen rápido */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">Créditos</p>
                            <p className="font-bold text-blue-700 text-sm md:text-base">{formatCOP(data.resumen.totalCreditos)}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">Contado</p>
                            <p className="font-bold text-green-700 text-sm md:text-base">{formatCOP(data.resumen.totalContado)}</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">Abonos</p>
                            <p className="font-bold text-yellow-700 text-sm md:text-base">{formatCOP(data.resumen.totalAbonos)}</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center col-span-2 md:col-span-1">
                            <p className="text-xs text-gray-500 mb-1">💰 Total Ingresos</p>
                            <p className="font-bold text-purple-700 text-sm md:text-base">{formatCOP(data.resumen.totalIngresos)}</p>
                        </div>
                    </div>

                    {/* Tabs navegación */}
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        {/* Tab headers — scrollable en móvil */}
                        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
                            {tabs.map(tab => (
                                <button key={tab.key}
                                    onClick={() => setTabActiva(tab.key)}
                                    className={`flex-shrink-0 px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                        ${tabActiva === tab.key
                                            ? "border-blue-500 text-blue-600 bg-blue-50"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}>
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs
                                            ${tabActiva === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="p-4">

                            {/* CRÉDITOS */}
                            {tabActiva === "creditos" && (
                                <TablaSeccion
                                    titulo="Cotizaciones a Crédito"
                                    columnas={["N° Cotización", "Cliente", "Subtotal"]}
                                    filas={data.creditos.map(c => [c.numero_cotizacion, c.cliente, formatCOP(c.subtotal)])}
                                    total={formatCOP(data.resumen.totalCreditos)}
                                    labelTotal="Total Créditos"
                                    colorTotal="text-blue-700"
                                    tarjetas={data.creditos.map(c => ({
                                        titulo: `#${c.numero_cotizacion}`,
                                        subtitulo: c.cliente,
                                        valor: formatCOP(c.subtotal),
                                        colorValor: "text-blue-700",
                                    }))}
                                />
                            )}

                            {/* CONTADO */}
                            {tabActiva === "contado" && (
                                <TablaSeccion
                                    titulo="Ventas de Contado"
                                    columnas={["N° Cotización", "Cliente", "Subtotal"]}
                                    filas={data.contado.map(c => [c.numero_cotizacion, c.cliente, formatCOP(c.subtotal)])}
                                    total={formatCOP(data.resumen.totalContado)}
                                    labelTotal="Total Contado"
                                    colorTotal="text-green-700"
                                    tarjetas={data.contado.map(c => ({
                                        titulo: `#${c.numero_cotizacion}`,
                                        subtitulo: c.cliente,
                                        valor: formatCOP(c.subtotal),
                                        colorValor: "text-green-700",
                                    }))}
                                />
                            )}

                            {/* ABONOS */}
                            {tabActiva === "abonos" && (
                                <TablaSeccion
                                    titulo="Abonos Realizados"
                                    columnas={["N° Recibo", "Cliente", "Valor"]}
                                    filas={data.abonos.map(a => [a.numero_recibo, a.cliente, formatCOP(a.valor)])}
                                    total={formatCOP(data.resumen.totalAbonos)}
                                    labelTotal="Total Abonos"
                                    colorTotal="text-yellow-700"
                                    tarjetas={data.abonos.map(a => ({
                                        titulo: `Recibo #${a.numero_recibo}`,
                                        subtitulo: a.cliente,
                                        valor: formatCOP(a.valor),
                                        colorValor: "text-yellow-700",
                                    }))}
                                />
                            )}

                            {/* RESUMEN */}
                            {tabActiva === "resumen" && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-gray-700 mb-3">Resumen General</h3>
                                    {[
                                        { label: "📝 Cotizaciones a Crédito", valor: data.resumen.totalCreditos, color: "bg-blue-50 border-blue-200 text-blue-700" },
                                        { label: "💵 Ventas de Contado", valor: data.resumen.totalContado, color: "bg-green-50 border-green-200 text-green-700" },
                                        { label: "📥 Ingresos por Abonos", valor: data.resumen.totalAbonos, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
                                        { label: "💰 Total Ingresos", valor: data.resumen.totalIngresos, color: "bg-purple-50 border-purple-200 text-purple-700" },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex justify-between items-center border rounded-xl px-4 py-3 ${item.color}`}>
                                            <span className="text-sm font-medium">{item.label}</span>
                                            <span className="font-bold text-sm md:text-base">{formatCOP(item.valor)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {!data && !loading && (
                <div className="text-center text-gray-400 py-16">
                    <p className="text-4xl mb-3">📊</p>
                    <p className="text-sm">Selecciona un rango de fechas y presiona "Generar"</p>
                </div>
            )}
        </div>
    );
}

/* Componente interno reutilizable */
function TablaSeccion({ titulo, columnas, filas, total, labelTotal, colorTotal, tarjetas }) {
    return (
        <div>
            <h3 className="font-bold text-gray-700 mb-3 text-sm md:text-base">{titulo}</h3>

            {/* Tabla — desktop */}
            <div className="hidden md:block overflow-x-auto rounded-lg border mb-3">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            {columnas.map((col, i) => (
                                <th key={i} className="border px-3 py-2 text-left font-semibold text-gray-600">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filas.length > 0 ? filas.map((fila, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                {fila.map((celda, j) => (
                                    <td key={j} className={`border px-3 py-2 ${j === fila.length - 1 ? "text-right font-medium" : ""}`}>
                                        {celda}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr><td colSpan={columnas.length} className="text-center py-4 text-gray-400">Sin registros</td></tr>
                        )}
                    </tbody>
                    {filas.length > 0 && (
                        <tfoot className="bg-gray-100 font-bold">
                            <tr>
                                <td colSpan={columnas.length - 1} className="px-3 py-2 text-right">{labelTotal}:</td>
                                <td className={`px-3 py-2 text-right ${colorTotal}`}>{total}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Tarjetas — móvil */}
            <div className="md:hidden space-y-2 mb-3">
                {tarjetas.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">Sin registros</p>
                )}
                {tarjetas.map((t, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 border rounded-xl px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{t.titulo}</p>
                            <p className="text-xs text-gray-500">{t.subtitulo}</p>
                        </div>
                        <p className={`font-bold text-sm ${t.colorValor}`}>{t.valor}</p>
                    </div>
                ))}
                {tarjetas.length > 0 && (
                    <div className={`flex justify-between items-center border rounded-xl px-4 py-3 bg-gray-100 font-bold`}>
                        <span className="text-sm">{labelTotal}:</span>
                        <span className={`text-sm ${colorTotal}`}>{total}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
