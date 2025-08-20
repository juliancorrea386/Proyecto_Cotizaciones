import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function ListaRecibos() {
    const [recibos, setRecibos] = useState([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [cliente, setCliente] = useState("");
    const [numeroRecibo, setNumeroRecibo] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        fetchRecibos();
    }, []);

    const fetchRecibos = (params = {}) => {
        axios
            .get("http://localhost:4000/api/recibos", { params })
            .then((res) => setRecibos(res.data))
            .catch((err) => console.error(err));
    };

    const aplicarFiltros = () => {
        const params = {};
        if (fechaInicio) params.desde = fechaInicio;
        if (fechaFin) params.hasta = fechaFin;
        if (cliente) params.cliente = cliente;
        if (numeroRecibo) params.numero = numeroRecibo;

        fetchRecibos(params);
    };
    const limpiarFiltros = () => {
        setFechaInicio("");
        setFechaFin("");
        setCliente("");
        setNumeroRecibo("");
        fetchRecibos(); // recargar todas
    };
    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">📄 Lista de Recibos</h2>
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
                    <label className="block text-gray-700">N° Recibo:</label>
                    <input
                        type="text"
                        placeholder="Ej: 1025"
                        value={numeroRecibo}
                        onChange={(e) => setNumeroRecibo(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
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
            {/* Tabla de recibos */}
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
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
                                <tr key={r.id} className="hover:bg-gray-100">
                                    <td className="p-3 border text-center">{r.numero_recibo}</td>
                                    <td className="p-3 border text-center">{new Date(r.fecha).toLocaleDateString("es-ES", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })}</td>
                                    <td className="p-3 border text-center">{r.cliente_nombre || "—"}</td>
                                    <td className="p-3 border text-center">
                                        {new Intl.NumberFormat("es-CO", {
                                            style: "currency",
                                            currency: "COP",
                                            minimumFractionDigits: 0,
                                        }).format(r.total_abonos || 0)}
                                    </td>
                                    <td className="p-3 border text-center space-x-2">
                                        <button
                                            onClick={() => navigate(`/editar-recibo/${r.id}`)}
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
                                            onClick={() => window.open(`http://localhost:4000/api/recibos/${r.id}/pdf`, "_blank")}
                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow-sm transition"
                                        >
                                            📄 PDF
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-3 text-center text-gray-500">
                                    No hay recibos registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {/* Pie de tabla con el total */}
                    {recibos.length > 0 && (
                        <tfoot className="bg-gray-100 font-bold">
                            <tr>
                                <td colSpan="3" className="p-3 text-right">
                                    TOTAL GENERAL:
                                </td>
                                <td className="p-3 text-right">
                                    {new Intl.NumberFormat("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        minimumFractionDigits: 0,
                                    }).format(
                                        recibos.reduce(
                                            (sum, c) => sum + (Number(c.total_abonos) || 0),
                                            0
                                        )
                                    )}
                                </td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
