import React, { useState, useEffect } from "react";
import movimientosService from "../services/movimientosService";

const formatCOP = (valor) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(valor || 0);

export default function MovimientosPage() {
    const [movimientos, setMovimientos] = useState([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [cliente, setCliente] = useState("");
    const [numeroCotizacion, setNumeroCotizacion] = useState("");
    const [numeroRecibo, setNumeroRecibo] = useState("");
    const [filtroAplicado, setFiltroAplicado] = useState(false);

    const fetchMovimientos = async (params = {}) => {
        try {
            const data = await movimientosService.getMovimientos(params);
            setMovimientos(data);
        } catch (err) {
            console.error(err);
        }
    };

    const aplicarFiltros = () => {
        const params = {};
        if (fechaInicio) params.desde = fechaInicio;
        if (fechaFin) params.hasta = fechaFin;
        if (cliente) params.cliente = cliente;
        if (numeroCotizacion) params.numero_cotizacion = numeroCotizacion;
        if (numeroRecibo) params.numero_recibo = numeroRecibo;
        setFiltroAplicado(true);
        fetchMovimientos(params);
    };

    const limpiarFiltros = () => {
        setFechaInicio("");
        setFechaFin("");
        setCliente("");
        setNumeroCotizacion("");
        setNumeroRecibo("");
        setFiltroAplicado(false);
        fetchMovimientos();
    };

    return (
        <div className="mt-4 px-2 sm:px-4 md:px-6">
            <h2 className="text-xl font-bold mb-4">📊 Movimientos</h2>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-col gap-3">
                {/* Fila 1: Fechas */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Desde:</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="border px-3 py-2 rounded w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Hasta:</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="border px-3 py-2 rounded w-full text-sm"
                        />
                    </div>
                </div>

                {/* Fila 2: Cliente */}
                <div>
                    <label className="block text-gray-700 text-sm mb-1">Cliente:</label>
                    <input
                        type="text"
                        placeholder="Nombre cliente"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm"
                    />
                </div>

                {/* Fila 3: N° Cotización y N° Recibo */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">N° Cotización</label>
                        <input
                            type="text"
                            value={numeroCotizacion}
                            onChange={(e) => setNumeroCotizacion(e.target.value)}
                            placeholder="Ej: 4011"
                            className="border rounded px-3 py-2 w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">N° Recibo</label>
                        <input
                            type="text"
                            value={numeroRecibo}
                            onChange={(e) => setNumeroRecibo(e.target.value)}
                            placeholder="Ej: 100"
                            className="border rounded px-3 py-2 w-full text-sm"
                        />
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                    <button
                        onClick={aplicarFiltros}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition text-sm"
                    >
                        🔍 Filtrar
                    </button>
                    <button
                        onClick={limpiarFiltros}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow transition text-sm"
                    >
                        ❌ Limpiar
                    </button>
                </div>
            </div>

            {/* Contenido */}
            {filtroAplicado ? (
                <>
                    {/* TABLA — visible en md+ */}
                    <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
                        <table className="w-full border-collapse bg-white">
                            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                <tr>
                                    <th className="p-3 text-left text-sm">N° Cotización</th>
                                    <th className="p-3 text-left text-sm">Cliente</th>
                                    <th className="p-3 text-left text-sm">Fecha</th>
                                    <th className="p-3 text-left text-sm">Tipo</th>
                                    <th className="p-3 text-right text-sm">Total</th>
                                    <th className="p-3 text-right text-sm">Abonado</th>
                                    <th className="p-3 text-right text-sm">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientos.length > 0 ? (
                                    movimientos.map((m, index) => (
                                        <tr key={index} className="border-b hover:bg-blue-50">
                                            <td className="p-3 text-sm">{m.numero_cotizacion}</td>
                                            <td className="p-3 text-sm">{m.cliente}</td>
                                            <td className="p-3 text-sm">{m.fecha_cotizacion}</td>
                                            <td className="p-3 text-sm capitalize">{m.tipo}</td>
                                            <td className="p-3 text-right font-semibold text-sm">
                                                {formatCOP(m.subtotal)}
                                            </td>
                                            <td className="p-3 text-sm">
                                                {m.recibo_id ? (
                                                    <>
                                                        <span className="block text-xs text-gray-500">
                                                            Recibo #{m.recibo_id} — {m.fecha_abono}
                                                        </span>
                                                        <span className="font-semibold text-green-600">
                                                            {formatCOP(m.valor_abono)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Sin abonos</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right font-semibold text-red-600 text-sm">
                                                {formatCOP(m.saldo)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-4 text-center text-gray-500">
                                            No hay movimientos para mostrar
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* TARJETAS — visible solo en móvil */}
                    <div className="md:hidden flex flex-col gap-3">
                        {movimientos.length > 0 ? (
                            movimientos.map((m, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow p-4 border border-gray-100"
                                >
                                    {/* Encabezado tarjeta */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-800">{m.cliente}</p>
                                            <p className="text-xs text-gray-400">
                                                Cot. #{m.numero_cotizacion} · {m.fecha_cotizacion}
                                            </p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded capitalize">
                                            {m.tipo}
                                        </span>
                                    </div>

                                    {/* Montos */}
                                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <p className="text-xs text-gray-400 mb-0.5">Total</p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {formatCOP(m.subtotal)}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-2">
                                            <p className="text-xs text-gray-400 mb-0.5">Abonado</p>
                                            <p className="text-sm font-semibold text-green-600">
                                                {m.recibo_id ? formatCOP(m.valor_abono) : "—"}
                                            </p>
                                        </div>
                                        <div className="bg-red-50 rounded-lg p-2">
                                            <p className="text-xs text-gray-400 mb-0.5">Saldo</p>
                                            <p className="text-sm font-semibold text-red-600">
                                                {formatCOP(m.saldo)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalle abono */}
                                    {m.recibo_id && (
                                        <p className="text-xs text-gray-400 text-right">
                                            Recibo #{m.recibo_id} · {m.fecha_abono}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">
                                No hay movimientos para mostrar
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-400 py-12 px-4">
                    <p className="text-4xl mb-3">🗓️</p>
                    <p className="text-base">
                        Ingresa un rango de fechas y presiona{" "}
                        <span className="font-semibold text-blue-500">"Filtrar"</span>{" "}
                        para ver los movimientos.
                    </p>
                </div>
            )}
        </div>
    );
}