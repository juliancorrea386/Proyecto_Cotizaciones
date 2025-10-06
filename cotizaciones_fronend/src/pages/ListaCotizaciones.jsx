import React, { useEffect, useState } from "react";
import axios from "axios";
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
    const navigate = useNavigate();
    const [filtroAplicado, setFiltroAplicado] = useState(false);


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
                console.error(err);
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
        fetchCotizaciones(); // recargar todas
    };

    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">📄 Lista de Cotizaciones</h2>
            <ToastContainer />

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                <div>
                    <label className="block text-gray-700">Desde:</label>
                    <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Hasta:</label>
                    <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Cliente:</label>
                    <input
                        type="text"
                        placeholder="Nombre cliente"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">N° Cotización:</label>
                    <input
                        type="text"
                        placeholder="Ej: 1025"
                        value={numeroCotizacion}
                        onChange={(e) => setNumeroCotizacion(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Tipo:</label>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    >
                        <option value="">-- Todos --</option>
                        <option value="contado">Contado</option>
                        <option value="credito">Crédito</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700">Estado:</label>
                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    >
                        <option value="">-- Todos --</option>
                        <option value="Abonada">Abonada</option>
                        <option value="Pagada">Pagada</option>
                        <option value="Pendiente">Pendiente</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={aplicarFiltros}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow w-full"
                    >
                        🔍 Filtrar
                    </button>
                    <button
                        onClick={limpiarFiltros}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow w-full"
                    >
                        ❌ Limpiar
                    </button>
                </div>
            </div>

            {/* Tabla */}
            {filtroAplicado ? (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="w-full border-collapse bg-white">
                        <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <tr >
                                <th className="p-3 text-left">N° Cotización</th>
                                <th className="p-3 text-left">Cliente</th>
                                <th className="p-3 text-left">Fecha</th>
                                <th className="p-3 text-left">Total</th>
                                <th className="p-3 text-left">Abono</th>
                                <th className="p-3 text-left">Saldo</th>
                                <th className="p-3 text-left">Estado</th>
                                <th className="p-3 text-left">Tipo</th>
                                <th className="p-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cotizaciones.length > 0 ? (
                                cotizaciones.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-b hover:bg-blue-50 transition-colors"
                                    >
                                        <td className="p-3">{c.numero_cotizacion}</td>
                                        <td className="p-3">{c.cliente}</td>
                                        <td className="p-3">
                                            {c.fecha}
                                        </td>
                                        <td className="p-3 text-left font-semibold">
                                            {new Intl.NumberFormat("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                                minimumFractionDigits: 0,
                                            }).format(c.subtotal)}
                                        </td>
                                        <td className="p-3 text-left font-semibold">
                                            {new Intl.NumberFormat("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                                minimumFractionDigits: 0,
                                            }).format(c.abonado)}
                                        </td>
                                        <td className="p-3 text-left font-semibold">
                                            {new Intl.NumberFormat("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                                minimumFractionDigits: 0,
                                            }).format(c.saldo)}
                                        </td>
                                        <td className="p-3 text-left font-semibold">{c.estado}</td>
                                        <td className="p-3 text-center font-semibold">{c.tipo}</td>
                                        <td className="p-3 text-center space-x-2">
                                            <button
                                                onClick={() => navigate(`/editar-cotizacion/${c.id}`)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-sm transition"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => eliminarCotizacion(c.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition"
                                            >
                                                ❌ Eliminar
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const cotizacionCompleta = await cotizacionesService.obtenerDetalle(c.id);
                                                        cotizacionesService.exportarCotizacionPDF(cotizacionCompleta); // 👈 función que genera el PDF
                                                    } catch (err) {
                                                        console.error("Error al generar PDF:", err);
                                                        toast.error("Error al generar el PDF");
                                                    }
                                                }}
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow-sm transition"
                                            >
                                                📄 PDF
                                            </button>

                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-4 text-gray-500">
                                        No hay cotizaciones para mostrar
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {/* Pie de tabla con el total */}
                        {cotizaciones.length > 0 && (
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    {/* Texto descriptivo ocupa las 3 primeras columnas */}
                                    <td colSpan="3" className="p-3 text-right">
                                        TOTALES:
                                    </td>

                                    {/* Subtotal */}
                                    <td className="p-3 text-center">
                                        {new Intl.NumberFormat("es-CO", {
                                            style: "currency",
                                            currency: "COP",
                                            minimumFractionDigits: 0,
                                        }).format(
                                            cotizaciones.reduce(
                                                (sum, c) => sum + (Number(c.subtotal) || 0),
                                                0
                                            )
                                        )}
                                    </td>

                                    {/* Abonado */}
                                    <td className="p-3 text-center">
                                        {new Intl.NumberFormat("es-CO", {
                                            style: "currency",
                                            currency: "COP",
                                            minimumFractionDigits: 0,
                                        }).format(
                                            cotizaciones.reduce(
                                                (sum, c) => sum + (Number(c.abonado) || 0),
                                                0
                                            )
                                        )}
                                    </td>

                                    {/* Saldo */}
                                    <td className="p-3 text-center">
                                        {new Intl.NumberFormat("es-CO", {
                                            style: "currency",
                                            currency: "COP",
                                            minimumFractionDigits: 0,
                                        }).format(
                                            cotizaciones.reduce(
                                                (sum, c) => sum + (Number(c.saldo) || 0),
                                                0
                                            )
                                        )}
                                    </td>

                                    {/* Estado y acciones vacíos */}
                                    <td colSpan="2"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            ) : (<div className="text-center text-gray-500 py-10">
                <p className="text-lg">🗓️ Ingresa un rango de fechas y presiona “Filtrar” para ver las cotizaciones.</p>
            </div>
            )}
        </div>
    );
}
