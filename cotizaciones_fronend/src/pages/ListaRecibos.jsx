import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import recibosService from "../services/recibosService";

export default function ListaRecibos() {
    const [recibos, setRecibos] = useState([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [cliente, setCliente] = useState("");
    const [numeroRecibo, setNumeroRecibo] = useState("");
    const [filtroAplicado, setFiltroAplicado] = useState(false);
    const navigate = useNavigate();

    const fetchRecibos = (params = {}) => {
        recibosService.listar(params)
            .then(data => setRecibos(data))
            .catch(err => console.error(err));
    };

    const aplicarFiltros = () => {
        const params = {};
        if (fechaInicio) params.desde = fechaInicio;
        if (fechaFin) params.hasta = fechaFin;
        if (cliente) params.cliente = cliente;
        if (numeroRecibo) params.numero = numeroRecibo;
        setFiltroAplicado(true);
        fetchRecibos(params);
    };

    const limpiarFiltros = () => {
        setFechaInicio("");
        setFechaFin("");
        setCliente("");
        setNumeroRecibo("");
        setFiltroAplicado(false);
    };

    const eliminarRecibo = async (id) => {
        if (window.confirm("¿Seguro que quieres eliminar este recibo?")) {
            try {
                await recibosService.eliminar(id);
                toast.success("Recibo eliminado con éxito");
                setRecibos(recibos.filter(r => r.id !== id));
            } catch {
                toast.error("Error al eliminar el recibo");
            }
        }
    };

    const formatCOP = (value) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(value || 0);

    const totalGeneral = recibos.reduce((s, r) => s + (Number(r.total_abonos) || 0), 0);

    return (
        <div className="mt-4">
            <h2 className="text-lg md:text-xl font-bold mb-4">📄 Lista de Recibos</h2>
            <ToastContainer />

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                    <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                    <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
                    <input type="text" placeholder="Nombre cliente" value={cliente}
                        onChange={e => setCliente(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">N° Recibo</label>
                    <input type="text" placeholder="Ej: 1025" value={numeroRecibo}
                        onChange={e => setNumeroRecibo(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm" />
                </div>
                <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
                    <button onClick={aplicarFiltros}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-medium">
                        🔍 Filtrar
                    </button>
                    <button onClick={limpiarFiltros}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow text-sm font-medium">
                        ❌ Limpiar
                    </button>
                </div>
            </div>

            {filtroAplicado ? (
                <>
                    {/* Tabla — desktop */}
                    <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
                        <table className="w-full border-collapse bg-white text-sm">
                            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                <tr>
                                    <th className="p-3 text-center">Número</th>
                                    <th className="p-3 text-center">Fecha</th>
                                    <th className="p-3 text-center">Cliente</th>
                                    <th className="p-3 text-center">Total Abonos</th>
                                    <th className="p-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recibos.length > 0 ? (
                                    recibos.map((r) => (
                                        <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-center font-medium">{r.numero_recibo}</td>
                                            <td className="p-3 text-center">{r.fecha}</td>
                                            <td className="p-3 text-center">{r.cliente_nombre || "—"}</td>
                                            <td className="p-3 text-center font-semibold text-green-700">
                                                {formatCOP(r.total_abonos)}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex gap-1 justify-center">
                                                    <button onClick={() => navigate(`/editar-recibo/${r.id}`)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                                                        ✏️ Editar
                                                    </button>
                                                    <button onClick={() => eliminarRecibo(r.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">
                                                        ❌ Eliminar
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/recibos/${r.id}/pdf`, "_blank")}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">
                                                        📄 PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="p-4 text-center text-gray-500">No hay recibos registrados</td></tr>
                                )}
                            </tbody>
                            {recibos.length > 0 && (
                                <tfoot className="bg-gray-100 font-bold text-sm">
                                    <tr>
                                        <td colSpan="3" className="p-3 text-right">TOTAL GENERAL:</td>
                                        <td className="p-3 text-center text-green-700">{formatCOP(totalGeneral)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Tarjetas — móvil */}
                    <div className="md:hidden space-y-3">
                        {recibos.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No hay recibos para mostrar</p>
                        )}
                        {recibos.map((r) => (
                            <div key={r.id} className="bg-white rounded-xl shadow p-4 border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-bold text-blue-700 text-base">Recibo #{r.numero_recibo}</span>
                                        <p className="text-xs text-gray-500 mt-0.5">📅 {r.fecha}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Total abonos</p>
                                        <p className="font-bold text-green-700 text-base">{formatCOP(r.total_abonos)}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 mb-3">
                                    👤 {r.cliente_nombre || "—"}
                                </p>

                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/editar-recibo/${r.id}`)}
                                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-xs font-medium">
                                        ✏️ Editar
                                    </button>
                                    <button onClick={() => eliminarRecibo(r.id)}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-medium">
                                        ❌ Eliminar
                                    </button>
                                    <button
                                        onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/recibos/${r.id}/pdf`, "_blank")}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-medium">
                                        📄 PDF
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Total móvil */}
                        {recibos.length > 0 && (
                            <div className="bg-gray-100 rounded-xl p-4 text-center font-bold border">
                                <p className="text-xs text-gray-500 mb-1">TOTAL GENERAL</p>
                                <p className="text-lg text-green-700">{formatCOP(totalGeneral)}</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-500 py-10 px-4">
                    <p className="text-base">🗓️ Ingresa un rango de fechas y presiona "Filtrar" para ver los recibos.</p>
                </div>
            )}
        </div>
    );
}
