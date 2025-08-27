import React, { useState } from "react";
import axios from "axios";
import reportesService from "../services/reportesService";
export default function ReporteVentasPage() {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [data, setData] = useState(null);

    const fetchReporte = async (params ={desde,hasta}) => {
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
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/reportes//reporte-ventas/pdf?desde=${desde}&hasta=${hasta}`, "_blank")}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow-sm transition"
                >
                    📄 PDF
                </button>
            </form>

            {data && (
                <div className="space-y-6">
                    {/* Créditos */}
                    <div className="bg-white shadow rounded p-4">
                        <h2 className="font-bold text-lg mb-2">📝 Cotizaciones a Crédito</h2>
                        <ul>
                            {data.creditos.map((c) => (
                                <li key={c.id} className="border-b py-1">
                                    {c.numero_cotizacion} - {c.cliente} - $
                                    {Number(c.subtotal).toLocaleString()}
                                </li>
                            ))}
                        </ul>
                        <p className="font-bold mt-2">
                            Total Créditos: ${Number(data.resumen.totalCreditos).toLocaleString()}
                        </p>
                    </div>

                    {/* Contado */}
                    <div className="bg-white shadow rounded p-4">
                        <h2 className="font-bold text-lg mb-2">💵 Ventas de Contado</h2>
                        <ul>
                            {data.contado.map((c) => (
                                <li key={c.id} className="border-b py-1">
                                    {c.numero_cotizacion} - {c.cliente} - $
                                    {Number(c.subtotal).toLocaleString()}
                                </li>
                            ))}
                        </ul>
                        <p className="font-bold mt-2">
                            Total Contado: ${Number(data.resumen.totalContado).toLocaleString()}
                        </p>
                    </div>

                    {/* Abonos */}
                    <div className="bg-white shadow rounded p-4">
                        <h2 className="font-bold text-lg mb-2">📥 Abonos Realizados</h2>
                        <ul>
                            {data.abonos.map((a, i) => (
                                <li key={i} className="border-b py-1">
                                    Recibo #{a.numero_recibo} - {a.cliente} - $
                                    {Number(a.valor).toLocaleString()}
                                </li>
                            ))}
                        </ul>
                        <p className="font-bold mt-2">
                            Total Abonos: ${Number(data.resumen.totalAbonos).toLocaleString()}
                        </p>
                    </div>

                    {/* Resumen */}
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
