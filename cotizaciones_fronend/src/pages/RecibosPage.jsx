import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RecibosPage() {
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState("");
    const [cotizaciones, setCotizaciones] = useState([]);
    const [numeroRecibo, setNumeroRecibo] = useState("");
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]); // Fecha actual en formato YYYY-MM-DD
    const [abonos, setAbonos] = useState([]);
    const [observacion, setObservacion] = useState("");

    // Cargar lista de clientes
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const res = await axios.get("http://localhost:4000/api/clientes");
                axios.get("http://localhost:4000/api/recibos/Numero").then(res => {
                    const numero = parseInt(res.data.mayor_numero) || 0;
                    setNumeroRecibo(numero + 1);
                }
                )
                setClientes(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchClientes();
    }, []);
    // Cargar cotizaciones del cliente seleccionado
    useEffect(() => {
        if (!clienteId) return;
        const fetchCotizaciones = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/cotizaciones/cliente/${clienteId}`);

                const fechaRecibo = fecha; // ya es YYYY-MM-DD

                const cotizacionesFiltradas = res.data.filter(cot => {
                    const fechaCot = new Date(cot.fecha).toISOString().split("T")[0]; // YYYY-MM-DD
                    return fechaCot <= fechaRecibo; // comparación directa de strings
                });

                setCotizaciones(cotizacionesFiltradas);
                setAbonos([]);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCotizaciones();
    }, [clienteId, fecha]);

    // Agregar fila
    const agregarAbono = () => {
        setAbonos([...abonos, { cotizacion_id: "", valor: "" }]);
    };

    // Eliminar fila
    const eliminarAbono = (index) => {
        const copia = [...abonos];
        copia.splice(index, 1);
        setAbonos(copia);
    };

    // Actualizar valor fila con validación
    // Actualizar valor fila con validación
    const actualizarAbono = (index, field, value) => {
        const copia = [...abonos];
        if (field === "valor") {
            const cot = cotizaciones.find(c => c.id == copia[index].cotizacion_id);
            if (cot && Number(value) > Number(cot.saldo)) {
                toast.error("⚠️ El abono no puede ser mayor al saldo de la cotización");
                return;
            }
        }
        copia[index][field] = value;
        setAbonos(copia);
    };

    // Guardar recibo
    const guardarRecibo = async () => {
        try {
            const payload = {
                numero_recibo: numeroRecibo,
                fecha,
                cliente_id: clienteId,
                observacion,
                abonos
            };
            await axios.post("http://localhost:4000/api/recibos", payload);
            toast.success("✅ Recibo registrado con éxito");
            setClienteId("");
            setObservacion("");
            setAbonos([]);
            setCotizaciones([]);
        } catch (err) {
            console.error(err);
            toast.error("❌ Error al registrar recibo");
        }
    };

    const subtotal = abonos.reduce((acc, abono) => acc + Number(abono.valor || 0), 0);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">🧾 Nuevo Recibo</h2>
            <ToastContainer />
            {/* Número de Recibo */}
            <div className="mb-4">
                <label className="block text-sm mb-1">Número de Recibo</label>
                <input
                    type="text"
                    value={numeroRecibo}
                    onChange={(e) => setNumeroRecibo(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>
            {/* Fecha */}
            <div className="mb-4">
                <label className="block text-sm mb-1">Fecha</label>
                <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            {/* Selección de Cliente */}
            <div className="mb-4">
                <label className="block text-sm mb-1">Cliente</label>
                <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="border p-2 rounded w-full"
                >
                    <option value="">Seleccione un cliente...</option>
                    {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* Observación */}
            <div className="mb-4">
                <label className="block text-sm mb-1">Observación</label>
                <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            {/* Tabla de abonos */}
            {clienteId && (
                <div className="overflow-x-auto shadow-md rounded-lg mb-4">
                    <table className="w-full border-collapse bg-white">
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
                                    <tr key={index} className="border-t">
                                        <td className="p-3 text-center">
                                            <select
                                                value={abono.cotizacion_id}
                                                onChange={(e) => actualizarAbono(index, "cotizacion_id", e.target.value)}
                                                className="border p-2 rounded"
                                            >
                                                <option value="">Seleccione...</option>
                                                {cotizaciones.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.numero_cotizacion}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3 text-center">
                                            {cot ? new Date(cot.fecha).toLocaleDateString("es-CO") : "-"}
                                        </td>
                                        <td className="p-3 text-center">
                                            {cot ? `${new Intl.NumberFormat("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                                minimumFractionDigits: 0,
                                            }).format(cot.saldo)}` : "-"}
                                        </td>
                                        <td className="p-3 text-center">
                                            <input
                                                type="text"
                                                value={
                                                    abono.valor
                                                        ? new Intl.NumberFormat("es-CO", {
                                                            style: "currency",
                                                            currency: "COP",
                                                            minimumFractionDigits: 0,
                                                        }).format(abono.valor)
                                                        : ""
                                                }
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\D/g, ""); // quitar todo lo que no sea número
                                                    actualizarAbono(index, "valor", rawValue ? parseInt(rawValue, 10) : "");
                                                }}
                                                className="border p-2 rounded w-32 text-right"
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => eliminarAbono(index)}
                                                className="bg-red-500 text-white px-3 py-1 rounded"
                                            >
                                                ❌
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {/* Subtotal */}
                        <tfoot>
                            <tr className="bg-gray-100 font-bold">
                                <td colSpan="3" className="p-3 text-right">Subtotal:</td>
                                <td className="p-3 text-center">
                                    ${abonos.reduce((acc, abono) => acc + Number(abono.valor || 0), 0).toLocaleString("es-CO")}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* Botones */}
            {clienteId && (
                <div className="flex gap-4">
                    <button
                        onClick={agregarAbono}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                    >
                        ➕ Agregar Abono
                    </button>
                    <button
                        onClick={guardarRecibo}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        💾 Guardar Recibo
                    </button>
                </div>
            )}
        </div>
    );
}
