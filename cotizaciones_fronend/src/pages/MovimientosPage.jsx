import React, { useState, useEffect } from "react";
import axios from "axios";
import movimientosService from "../services/movimientosService";
export default function MovimientosPage() {
    const [movimientos, setMovimientos] = useState([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [cliente, setCliente] = useState("");
    const [numeroCotizacion, setNumeroCotizacion] = useState("");
    const [numeroRecibo, setNumeroRecibo] = useState("");

    useEffect(() => {
        fetchMovimientos();
    }, []);


    const fetchMovimientos = async (params = {}) => {
        try {
            const data = await movimientosService.getMovimientos(params);
            setMovimientos(data);
        } catch (err) {
            console.error(err);
            toast.error("Error cargando cotizaciones");
        }
    };

    const aplicarFiltros = () => {
        const params = {};
        if (fechaInicio) params.desde = fechaInicio;
        if (fechaFin) params.hasta = fechaFin;
        if (cliente) params.cliente = cliente;
        if (numeroCotizacion) params.numero_cotizacion = numeroCotizacion;
        if (numeroRecibo) params.numero_recibo = numeroRecibo;

        fetchMovimientos(params);
    };

    const limpiarFiltros = () => {
        setFechaInicio("");
        setFechaFin("");
        setCliente("");
        setNumeroCotizacion("");
        setNumeroRecibo("");
        fetchMovimientos();

    };

    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">📊 Movimientos</h2>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
                    <label className="block text-sm">N° Cotización</label>
                    <input
                        type="text"
                        value={numeroCotizacion}
                        onChange={(e) => setNumeroCotizacion(e.target.value)}
                        placeholder="Ej: 4011"
                        className="border rounded px-2 py-1 w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm">N° Recibo</label>
                    <input
                        type="text"
                        value={numeroRecibo}
                        onChange={(e) => setNumeroRecibo(e.target.value)}
                        placeholder="Ej: 100"
                        className="border rounded px-2 py-1 w-full"
                    />
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
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <tr>
                            <th className="p-3 text-left">N° Cotización</th>
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-left">Fecha</th>
                            <th className="p-3 text-left">Tipo</th>
                            <th className="p-3 text-right">Total</th>
                            <th className="p-3 text-right">Abonado</th>
                            <th className="p-3 text-right">Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos.length > 0 ? (
                            movimientos.map((m, index) => (
                                <tr key={index} className="border-b hover:bg-blue-50">
                                    <td className="p-3">{m.numero_cotizacion}</td>
                                    <td className="p-3">{m.cliente}</td>
                                    <td className="p-3">
                                        {new Date(m.fecha_cotizacion).toLocaleDateString("es-ES")}
                                    </td>
                                    <td className="p-3 capitalize">{m.tipo}</td>
                                    <td className="p-3 text-right font-semibold">
                                        {new Intl.NumberFormat("es-CO", {
                                            style: "currency",
                                            currency: "COP",
                                            minimumFractionDigits: 0,
                                        }).format(m.subtotal)}
                                    </td>

                                    {/* Abono individual */}
                                    <td className="p-3">
                                        {m.recibo_id ? (
                                            <>
                                                <span className="block text-sm text-gray-500">
                                                    Recibo #{m.recibo_id} -{" "}
                                                    {new Date(m.fecha_abono).toLocaleDateString("es-ES")}
                                                </span>
                                                <span className="font-semibold text-green-600">
                                                    {new Intl.NumberFormat("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                        minimumFractionDigits: 0,
                                                    }).format(m.valor_abono)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 italic">Sin abonos</span>
                                        )}
                                    </td>

                                    {/* Saldo actual */}
                                    <td className="p-3 text-right font-semibold text-red-600">
                                        {new Intl.NumberFormat("es-CO", {
                                            style: "currency",
                                            currency: "COP",
                                            minimumFractionDigits: 0,
                                        }).format(m.saldo)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-4 text-center text-gray-500">
                                    No hay movimientos para mostrar
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
