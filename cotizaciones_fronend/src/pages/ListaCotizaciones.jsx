import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import cotizacionesService from "../services/cotizacionesService";

export default function ListaCotizaciones() {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [cliente, setCliente] = useState("");
    const [numeroCotizacion, setNumeroCotizacion] = useState("");
    const [tipo, setTipo] = useState("");
    const [estado, setEstado] = useState("");
    const [filtroAplicado, setFiltroAplicado] = useState(false);
    const navigate = useNavigate();

    const fetchCotizaciones = async (params = {}) => {
        try {
            const data = await cotizacionesService.listar(params);
            setCotizaciones(data);
        } catch (err) {
            console.error(err);
            toast.error("Error cargando cotizaciones");
        }
    };

    const eliminarCotizacion = async (id) => {
        if (window.confirm("¿Seguro que quieres eliminar esta cotización?")) {
            try {
                await cotizacionesService.eliminar(id);
                toast.success("Cotización eliminada con éxito");
                setCotizaciones(cotizaciones.filter((c) => c.id !== id));
            } catch (err) {
                toast.error("Error al eliminar la cotización");
            }
        }
    };

    const aplicarFiltros = () => {
        const params = {};
        if (fechaInicio) params.desde = fechaInicio;
        if (fechaFin) params.hasta = fechaFin;
        if (cliente) params.cliente = cliente;
        if (numeroCotizacion) params.numero = numeroCotizacion;
        if (tipo) params.tipo = tipo;
        if (estado) params.estado = estado;
        setFiltroAplicado(true);
        fetchCotizaciones(params);
    };

    const limpiarFiltros = () => {
        setFechaInicio("");
        setFechaFin("");
        setCliente("");
        setNumeroCotizacion("");
        setTipo("");
        setEstado("");
        setFiltroAplicado(false);
        fetchCotizaciones();
    };

    const formatCOP = (value) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(value);

    const estadoColor = (estado) => {
        if (estado === "Pagada") return "bg-green-100 text-green-700";
        if (estado === "Pendiente") return "bg-red-100 text-red-700";
        return "bg-yellow-100 text-yellow-700";
    };

    const totalSubtotal = cotizaciones.reduce((s, c) => s + (Number(c.subtotal) || 0), 0);
    const totalAbonado = cotizaciones.reduce((s, c) => s + (Number(c.abonado) || 0), 0);
    const totalSaldo = cotizaciones.reduce((s, c) => s + (Number(c.saldo) || 0), 0);

    return (
        <div className="mt-4">
            <h2 className="text-lg md:text-xl font-bold mb-4">📄 Lista de Cotizaciones</h2>
            <ToastContainer />

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-end">
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">N° Cotización</label>
                    <input type="text" placeholder="Ej: 1025" value={numeroCotizacion}
                        onChange={e => setNumeroCotizacion(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm">
                        <option value="">-- Todos --</option>
                        <option value="contado">Contado</option>
                        <option value="credito">Crédito</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                    <select value={estado} onChange={e => setEstado(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm">
                        <option value="">-- Todos --</option>
                        <option value="Abonada">Abonada</option>
                        <option value="Pagada">Pagada</option>
                        <option value="Pendiente">Pendiente</option>
                    </select>
                </div>
                <div className="flex gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-6">
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
                    {/* Tabla — solo desktop/tablet */}
                    <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
                        <table className="w-full border-collapse bg-white text-sm">
                            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                <tr>
                                    <th className="p-3 text-left">N° Cot.</th>
                                    <th className="p-3 text-left">Cliente</th>
                                    <th className="p-3 text-left">Fecha</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3 text-right">Abono</th>
                                    <th className="p-3 text-right">Saldo</th>
                                    <th className="p-3 text-center">Estado</th>
                                    <th className="p-3 text-center">Tipo</th>
                                    <th className="p-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cotizaciones.length > 0 ? (
                                    cotizaciones.map((c) => (
                                        <tr key={c.id} className="border-b hover:bg-blue-50 transition-colors">
                                            <td className="p-3 font-medium">{c.numero_cotizacion}</td>
                                            <td className="p-3">{c.cliente}</td>
                                            <td className="p-3">{c.fecha}</td>
                                            <td className="p-3 text-right">{formatCOP(c.subtotal)}</td>
                                            <td className="p-3 text-right">{formatCOP(c.abonado)}</td>
                                            <td className="p-3 text-right">{formatCOP(c.saldo)}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoColor(c.estado)}`}>
                                                    {c.estado}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center capitalize">{c.tipo}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex gap-1 justify-center flex-wrap">
                                                    <button onClick={() => navigate(`/editar-cotizacion/${c.id}`)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                                                        ✏️ Editar
                                                    </button>
                                                    <button onClick={() => eliminarCotizacion(c.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">
                                                        ❌ Eliminar
                                                    </button>
                                                    <button onClick={async () => {
                                                        try {
                                                            const det = await cotizacionesService.obtenerDetalle(c.id);
                                                            cotizacionesService.exportarCotizacionPDF(det);
                                                        } catch { toast.error("Error al generar el PDF"); }
                                                    }}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">
                                                        📄 PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="9" className="text-center p-4 text-gray-500">No hay cotizaciones</td></tr>
                                )}
                            </tbody>
                            {cotizaciones.length > 0 && (
                                <tfoot className="bg-gray-100 font-bold text-sm">
                                    <tr>
                                        <td colSpan="3" className="p-3 text-right">TOTALES:</td>
                                        <td className="p-3 text-right">{formatCOP(totalSubtotal)}</td>
                                        <td className="p-3 text-right">{formatCOP(totalAbonado)}</td>
                                        <td className="p-3 text-right">{formatCOP(totalSaldo)}</td>
                                        <td colSpan="3"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Tarjetas — solo móvil */}
                    <div className="md:hidden space-y-3">
                        {cotizaciones.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No hay cotizaciones para mostrar</p>
                        )}
                        {cotizaciones.map((c) => (
                            <div key={c.id} className="bg-white rounded-xl shadow p-4 border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-bold text-blue-700 text-base">#{c.numero_cotizacion}</span>
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${estadoColor(c.estado)}`}>
                                            {c.estado}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">{c.tipo}</span>
                                </div>

                                <p className="text-sm font-medium text-gray-800 mb-1">{c.cliente}</p>
                                <p className="text-xs text-gray-500 mb-3">📅 {c.fecha}</p>

                                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                                    <div className="bg-gray-50 rounded-lg p-2">
                                        <p className="text-xs text-gray-500">Total</p>
                                        <p className="text-xs font-bold text-gray-800">{formatCOP(c.subtotal)}</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-2">
                                        <p className="text-xs text-gray-500">Abono</p>
                                        <p className="text-xs font-bold text-blue-700">{formatCOP(c.abonado)}</p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-2">
                                        <p className="text-xs text-gray-500">Saldo</p>
                                        <p className="text-xs font-bold text-red-600">{formatCOP(c.saldo)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/editar-cotizacion/${c.id}`)}
                                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-xs font-medium">
                                        ✏️ Editar
                                    </button>
                                    <button onClick={() => eliminarCotizacion(c.id)}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-medium">
                                        ❌ Eliminar
                                    </button>
                                    <button onClick={async () => {
                                        try {
                                            const det = await cotizacionesService.obtenerDetalle(c.id);
                                            cotizacionesService.exportarCotizacionPDF(det);
                                        } catch { toast.error("Error al generar el PDF"); }
                                    }}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-medium">
                                        📄 PDF
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Totales móvil */}
                        {cotizaciones.length > 0 && (
                            <div className="bg-gray-100 rounded-xl p-4 border font-bold text-sm">
                                <p className="text-center text-gray-700 mb-2">TOTALES</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-xs text-gray-500">Total</p>
                                        <p className="text-xs">{formatCOP(totalSubtotal)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Abonado</p>
                                        <p className="text-xs text-blue-700">{formatCOP(totalAbonado)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Saldo</p>
                                        <p className="text-xs text-red-600">{formatCOP(totalSaldo)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-500 py-10 px-4">
                    <p className="text-base">🗓️ Ingresa un rango de fechas y presiona "Filtrar" para ver las cotizaciones.</p>
                </div>
            )}
        </div>
    );
}
