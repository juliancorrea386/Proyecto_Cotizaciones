// src/pages/EditarCotizacion.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import clientesService from "../services/clientesService";
import productosService from "../services/productosService";
import cotizacionesService from "../services/cotizacionesService";
const EditarCotizacion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [numeroCotizacion, setNumeroCotizacion] = useState("");
    const [fecha, setFecha] = useState("");
    const [clienteId, setClienteId] = useState("");
    const [clientes, setClientes] = useState([]);
    const [tipo, setTipo] = useState("contado");
    const [productos, setProductos] = useState([]);

    // Cargar clientes para el select
    useEffect(() => {
        clientesService.listar()
            .then(res => setClientes(res))
            .catch(() => toast.error("Error al cargar clientes"));
    }, []);

    // Cargar datos de la cotización
    useEffect(() => {
        const cargarCotizacion = async () => {
            try {
                const cot = await cotizacionesService.obtenerPorId(id);
                setNumeroCotizacion(cot.numero_cotizacion);
                setFecha(cot.fecha.split("T")[0]); // formato YYYY-MM-DD
                setClienteId(cot.cliente_id);
                setTipo(cot.tipo);
                setProductos(cot.productos || []);
            } catch (err) {
                toast.error("Error al cargar la cotización");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            cargarCotizacion();
        }
    }, [id]);

    const actualizarProducto = (index, campo, valor) => {
        const nuevos = [...productos];
        nuevos[index][campo] = valor || 0; // evitar NaN
        setProductos(nuevos);
    };

    const guardarCambios = async () => {
        if (!numeroCotizacion || !fecha || !clienteId || productos.length === 0) {
            toast.warning("Completa todos los campos y productos");
            return;
        }

        try {
            await cotizacionesService.actualizar(id, {
                numero_cotizacion: numeroCotizacion,
                fecha,
                cliente_id: clienteId,
                tipo,
                productos,
            });

            toast.success("Cotización actualizada con éxito", {
                position: "top-center",
                autoClose: 2500,
                theme: "colored",
            });

            navigate("/lista-cotizaciones");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar la cotización");
        }
    };

    const totalGeneral = productos.reduce(
        (acc, p) => acc + (p.precio_venta || 0) * (p.cantidad || 0),
        0
    );

    if (loading) return <p className="p-4">Cargando...</p>;

    return (
        <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                ✏️ Editar Cotización
            </h2>

            {/* Datos generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Número de Cotización
                    </label>
                    <input
                        type="text"
                        value={numeroCotizacion}
                        onChange={(e) => setNumeroCotizacion(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Fecha
                    </label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Cliente
                    </label>
                    <select
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Seleccione un cliente</option>
                        {clientes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Tipo de Factura
                    </label>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="contado">Contado</option>
                        <option value="credito">Crédito</option>
                    </select>
                </div>
            </div>

            {/* Detalle de cotización */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    📋 Detalle Cotización
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="w-full border-collapse">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="border p-3 text-left text-sm font-medium text-gray-600">Producto</th>
                                <th className="border p-3 text-center text-sm font-medium text-gray-600">Precio</th>
                                <th className="border p-3 text-center text-sm font-medium text-gray-600">Cantidad</th>
                                <th className="border p-3 text-center text-sm font-medium text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="border p-3">{p.nombre}</td>
                                    <td className="border p-3 text-center">
                                        <input
                                            type="number"
                                            value={p.precio_venta}
                                            onChange={(e) =>
                                                actualizarProducto(i, "precio_venta", parseFloat(e.target.value))
                                            }
                                            className="border border-gray-300 p-1 w-24 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                                        />
                                    </td>
                                    <td className="border p-3 text-center">
                                        <input
                                            type="number"
                                            value={p.cantidad}
                                            onChange={(e) =>
                                                actualizarProducto(i, "cantidad", parseInt(e.target.value))
                                            }
                                            className="border border-gray-300 p-1 w-20 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                                        />
                                    </td>
                                    <td className="border p-3 text-center font-medium text-gray-700">
                                        ${(p.precio_venta * p.cantidad).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-end items-center text-xl font-bold text-black-600">
                Subtotal: ${totalGeneral.toFixed(2)}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={guardarCambios}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
                >
                    💾 Guardar Cambios
                </button>
                <button
                    onClick={() => navigate("/lista-cotizaciones")}
                    className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-all"
                >
                    ❌ Cancelar
                </button>
            </div>
        </div>
    );
};

export default EditarCotizacion;
