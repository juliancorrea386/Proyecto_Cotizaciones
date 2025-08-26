import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
export default function Cotizaciones() {
    const [fecha, setFecha] = useState("");
    const [numeroCotizacion, setNumeroCotizacion] = useState("");
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState("");
    const [productos, setProductos] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [tipo, setTipo] = useState("");
    const [busqueda, setBusqueda] = useState("");
    useEffect(() => {
        axios.get("http://localhost:4000/api/clientes").then(res => setClientes(res.data));
        axios.get("http://localhost:4000/api/productos").then(res => setProductos(res.data));
        axios.get("http://localhost:4000/api/cotizaciones/Numero").then(res => {
            const numero = parseInt(res.data.mayor_numero) || 0;
            setNumeroCotizacion(numero + 1);
        }
        )
    }, []);

    const agregarProducto = (opcion) => {
        if (!opcion) return;

        // Buscar el producto real (para tener precio y demás)
        const producto = productos.find(p => p.id === opcion.value);

        // Evitar duplicados
        if (productosSeleccionados.some(p => p.id === producto.id)) {
            alert("Este producto ya fue agregado");
            return;
        }

        setProductosSeleccionados([
            ...productosSeleccionados,
            {
                id: producto.id,
                nombre: producto.nombre,
                precio_venta: producto.precio_venta,
                cantidad: 1,
            },
        ]);
    };
    const actualizarProducto = (index, campo, valor) => {
        const nuevos = [...productosSeleccionados];
        nuevos[index][campo] = valor;
        setProductosSeleccionados(nuevos);
    };

    const subtotal = productosSeleccionados.reduce((acc, p) => acc + (p.precio_venta * p.cantidad), 0);

    const guardarCotizacion = async () => {
        try {
            await axios.post("http://localhost:4000/api/cotizaciones", {
                numero_cotizacion: numeroCotizacion,
                fecha,
                cliente_id: clienteId,
                tipo,
                productos: productosSeleccionados
            });

            toast.success("Cotización guardada con éxito", {
                position: "top-center",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored"
            });

            // 🔹 Limpiar todos los campos después de guardar
            setFecha("");
            setNumeroCotizacion(numeroCotizacion + 1);
            setClienteId("");
            setTipo("");
            setBusqueda("");
            setProductosSeleccionados([]);
        } catch (error) {
            toast.error("Error al guardar la cotización", {
                position: "top-center"
            });
            console.error(error);
        }
    };

    const eliminarProducto = (index) => {
        setProductosSeleccionados(productosSeleccionados.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2" > 📝Nueva Cotización</h2>

            <ToastContainer />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

                <input
                    type="date"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    className="border p-2 rounded-md"
                />
                <input
                    type="text"
                    placeholder="Número cotización"
                    value={numeroCotizacion} onChange={e => setNumeroCotizacion(e.target.value)}
                    className="border p-2 rounded-md"
                />
                <select
                    value={tipo}
                    onChange={e => {
                        const nuevoTipo = e.target.value;
                        setTipo(nuevoTipo);

                        if (nuevoTipo === "contado") {
                            const clienteDefault = clientes.find(c => c.nombre.includes("CUANTIAS MENORES"));
                            if (clienteDefault) {
                                setClienteId(clienteDefault.id);
                            }
                        }
                    }}
                    className="border p-2 rounded-md"
                >
                    <option value="">Seleccione tipo</option>
                    <option value="contado">Contado</option>
                    <option value="credito">Crédito</option>
                </select>

                <select
                    value={clienteId} onChange={e => setClienteId(e.target.value)}
                    className="border p-2 rounded-md"
                >
                    <option value="">Seleccione cliente</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>


            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">Productos</h3>

            {/* 🔽 Selector con búsqueda */}
            <Select
                options={productos.map(p => ({
                    value: p.id,
                    label: `${p.nombre} - $${p.precio_venta}`,
                }))}
                onChange={agregarProducto}
                placeholder="🔍 Buscar producto..."
            />

            <h3 className="text-lg font-semibold mt-4">Detalle Cotización</h3>
            <div className="overflow-x-auto mt-2">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <tr>
                            <th className="p-3 text-left">Producto</th>
                            <th className="p-3 text-center">Precio</th>
                            <th className="p-3 text-center">Cantidad</th>
                            <th className="p-3 text-center">Total</th>
                            <th className="p-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosSeleccionados.map((p, i) => (
                            <tr
                                key={i}
                                className="border-b hover:bg-blue-50 transition-colors"
                            >
                                <td className="p-3">{p.nombre}</td>
                                <td className="p-3 text-center">
                                    <input
                                        type="text"
                                        value={new Intl.NumberFormat("es-CO", {
                                            style: "currency",
                                            currency: "COP",
                                            minimumFractionDigits: 0,
                                        }).format(p.precio_venta)}
                                        onChange={e => {
                                            const raw = e.target.value.replace(/[^0-9]/g, ""); // deja solo números
                                            actualizarProducto(i, "precio_venta", parseInt(raw) || 0);
                                        }}
                                        className="w-32 border rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </td>
                                <td className="p-3 text-center">
                                    <input
                                        type="number"
                                        value={p.cantidad}
                                        onChange={e => actualizarProducto(i, "cantidad", parseInt(e.target.value))}
                                        className="w-16 border rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </td>
                                <td className="p-3 text-center font-semibold text-gray-700">
                                    {new Intl.NumberFormat("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        minimumFractionDigits: 0,
                                    }).format(p.precio_venta * p.cantidad)}
                                </td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => eliminarProducto(i)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition"
                                    >
                                        ❌ Quitar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            <div className="flex justify-between items-center mt-4">
                <h3 className="text-lg font-bold">Subtotal: {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                }).format(subtotal)}</h3>
                <button
                    onClick={guardarCotizacion}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >Guardar Cotización</button>
            </div>
        </div>
    );
}
