import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clientesService from "../services/clientesService";
import recibosService from "../services/recibosService";
import cotizacionesService from "../services/cotizacionesService";
import { PlusCircle, Save, Trash2, FileText } from "lucide-react";

export default function RecibosPage() {
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState("");
    const [cotizaciones, setCotizaciones] = useState([]);
    const [numeroRecibo, setNumeroRecibo] = useState("");
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [abonos, setAbonos] = useState([]);
    const [observacion, setObservacion] = useState("");

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const res = await clientesService.listar();
                const ultimoNumero = await recibosService.obtenerUltimoNumero();
                setNumeroRecibo(ultimoNumero);
                setClientes(res);
            } catch (err) {
                console.error(err);
            }
        };
        fetchClientes();
    }, []);

    useEffect(() => {
        if (!clienteId) return;
        const fetchCotizaciones = async () => {
            try {
                const todas = await cotizacionesService.obtenerPorCliente(clienteId);
                const filtradas = todas.filter((cot) => {
                    const [dia, mes, anio] = cot.fecha.split("-");
                    return new Date(`${anio}-${mes}-${dia}`) <= new Date(fecha);
                });
                setCotizaciones(filtradas);
                setAbonos([]);
            } catch (err) {
                console.error("Error cargando cotizaciones del cliente:", err);
            }
        };
        fetchCotizaciones();
    }, [clienteId, fecha]);

    const agregarAbono = () => {
        setAbonos([...abonos, { cotizacion_id: "", valor: "" }]);
    };

    const eliminarAbono = (index) => {
        const copia = [...abonos];
        copia.splice(index, 1);
        setAbonos(copia);
    };

    const actualizarAbono = (index, field, value) => {
        const copia = [...abonos];
        if (field === "valor") {
            const cot = cotizaciones.find((c) => c.id == copia[index].cotizacion_id);
            if (cot && Number(value) > Number(cot.saldo)) {
                toast.error("⚠️ El abono no puede ser mayor al saldo de la cotización");
                return;
            }
        }
        copia[index][field] = value;
        setAbonos(copia);
    };

    const guardarRecibo = async () => {
        try {
            await recibosService.crear({
                numero_recibo: numeroRecibo,
                fecha,
                cliente_id: clienteId,
                observacion,
                abonos,
            });
            toast.success("✅ Recibo registrado con éxito");
            setClienteId("");
            setObservacion("");
            setAbonos([]);
            setNumeroRecibo((num) => Number(num) + 1);
            setCotizaciones([]);
        } catch (err) {
            console.error(err);
            toast.error("❌ Error al registrar recibo");
        }
    };

    const formatCOP = (value) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value || 0);

    const subtotal = abonos.reduce((acc, a) => acc + Number(a.valor || 0), 0);

    return (
        <div className="p-3 md:p-6 max-w-6xl mx-auto">
            <ToastContainer />

            <div className="flex items-center gap-3 mb-4 md:mb-6">
                <FileText className="text-green-600 w-6 h-6 md:w-8 md:h-8" />
                <h2 className="text-lg md:text-2xl font-bold text-gray-800">🧾 Nuevo Recibo</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-4 md:space-y-6">

                {/* Número y Fecha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Número de Recibo</label>
                        <input type="text" value={numeroRecibo}
                            onChange={e => setNumeroRecibo(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                        <input type="date" value={fecha}
                            onChange={e => setFecha(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400" />
                    </div>
                </div>

                {/* Cliente */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
                    <select value={clienteId} onChange={e => setClienteId(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400">
                        <option value="">Seleccione un cliente...</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>

                {/* Observación */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Observación</label>
                    <textarea value={observacion} onChange={e => setObservacion(e.target.value)}
                        rows={2}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400" />
                </div>

                {/* Abonos */}
                {clienteId && (
                    <>
                        {/* Tabla abonos — desktop */}
                        <div className="hidden md:block overflow-x-auto border rounded-xl shadow-md">
                            <table className="w-full border-collapse bg-white text-sm">
                                <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                                    <tr>
                                        <th className="p-3 text-center">Cotización</th>
                                        <th className="p-3 text-center">Fecha</th>
                                        <th className="p-3 text-center">Saldo</th>
                                        <th className="p-3 text-center">Valor Abono</th>
                                        <th className="p-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abonos.map((abono, index) => {
                                        const cot = cotizaciones.find(c => c.id == abono.cotizacion_id);
                                        return (
                                            <tr key={index} className={`border-t ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                                                <td className="p-3 text-center">
                                                    <select value={abono.cotizacion_id}
                                                        onChange={e => actualizarAbono(index, "cotizacion_id", e.target.value)}
                                                        className="border rounded-lg px-2 py-1 text-sm">
                                                        <option value="">Seleccione...</option>
                                                        {cotizaciones.map(c => (
                                                            <option key={c.id} value={c.id}>{c.numero_cotizacion}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-3 text-center text-sm">{cot ? cot.fecha : "-"}</td>
                                                <td className="p-3 text-center font-semibold text-blue-600">
                                                    {cot ? formatCOP(cot.saldo) : "-"}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <input
                                                        type="text"
                                                        value={abono.valor ? formatCOP(abono.valor) : ""}
                                                        onKeyDown={e => {
                                                            if (e.key.toLowerCase() === "d") {
                                                                const c = cotizaciones.find(c => c.id == abono.cotizacion_id);
                                                                if (c) actualizarAbono(index, "valor", c.saldo);
                                                            }
                                                        }}
                                                        onChange={e => {
                                                            const raw = e.target.value.replace(/\D/g, "");
                                                            actualizarAbono(index, "valor", raw ? parseInt(raw, 10) : "");
                                                        }}
                                                        className="border-2 border-gray-400 focus:border-blue-500 rounded-lg px-2 py-1 w-32 text-right text-sm"
                                                    />
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button onClick={() => eliminarAbono(index)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 mx-auto">
                                                        <Trash2 size={14} /> Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-100 font-bold">
                                        <td colSpan="3" className="p-3 text-right text-sm">Subtotal:</td>
                                        <td className="p-3 text-center text-sm text-green-700">{formatCOP(subtotal)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Tarjetas abonos — móvil */}
                        <div className="md:hidden space-y-3">
                            {abonos.length === 0 && (
                                <p className="text-center text-gray-400 text-sm py-3">
                                    Toca "Agregar Abono" para comenzar
                                </p>
                            )}
                            {abonos.map((abono, index) => {
                                const cot = cotizaciones.find(c => c.id == abono.cotizacion_id);
                                return (
                                    <div key={index} className="bg-gray-50 border rounded-xl p-3 shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-semibold text-gray-700">Abono #{index + 1}</span>
                                            <button onClick={() => eliminarAbono(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                                <Trash2 size={12} /> Eliminar
                                            </button>
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-xs text-gray-500 mb-1">Cotización</label>
                                            <select value={abono.cotizacion_id}
                                                onChange={e => actualizarAbono(index, "cotizacion_id", e.target.value)}
                                                className="border rounded-lg px-3 py-2 text-sm w-full">
                                                <option value="">Seleccione cotización...</option>
                                                {cotizaciones.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        #{c.numero_cotizacion} — {formatCOP(c.saldo)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {cot && (
                                            <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                                                <div className="bg-white rounded-lg p-2 border">
                                                    <p className="text-xs text-gray-500">Fecha cot.</p>
                                                    <p className="text-xs font-medium">{cot.fecha}</p>
                                                </div>
                                                <div className="bg-blue-50 rounded-lg p-2 border">
                                                    <p className="text-xs text-gray-500">Saldo</p>
                                                    <p className="text-xs font-bold text-blue-700">{formatCOP(cot.saldo)}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Valor Abono</label>
                                            <input
                                                type="text"
                                                value={abono.valor ? formatCOP(abono.valor) : ""}
                                                onChange={e => {
                                                    const raw = e.target.value.replace(/\D/g, "");
                                                    actualizarAbono(index, "valor", raw ? parseInt(raw, 10) : "");
                                                }}
                                                placeholder="$ 0"
                                                className="border-2 border-gray-300 focus:border-green-400 rounded-lg px-3 py-2 text-sm w-full text-right"
                                            />
                                            {cot && (
                                                <button
                                                    onClick={() => actualizarAbono(index, "valor", cot.saldo)}
                                                    className="mt-1 text-xs text-blue-600 underline"
                                                >
                                                    Usar saldo completo ({formatCOP(cot.saldo)})
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Subtotal móvil */}
                            {abonos.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500">Subtotal</p>
                                    <p className="text-lg font-bold text-green-700">{formatCOP(subtotal)}</p>
                                </div>
                            )}
                        </div>

                        {/* Botones acción */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button onClick={agregarAbono}
                                className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg shadow font-medium text-sm">
                                <PlusCircle size={18} /> Agregar Abono
                            </button>
                            <button onClick={guardarRecibo}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow font-medium text-sm">
                                <Save size={18} /> Guardar Recibo
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
