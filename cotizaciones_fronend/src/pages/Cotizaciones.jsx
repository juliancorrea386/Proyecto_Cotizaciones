import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import clientesService from "../services/clientesService";
import productosService from "../services/productosService";
import cotizacionesService from "../services/cotizacionesService";

export default function Cotizaciones() {
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [numeroCotizacion, setNumeroCotizacion] = useState("");
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState("");
    const [productos, setProductos] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [tipo, setTipo] = useState("");

    useEffect(() => {
        clientesService.listar()
            .then(data => setClientes(data))
            .catch(() => toast.error("No se pudieron cargar los clientes"));

        productosService.listar()
            .then(data => setProductos(data))
            .catch(() => toast.error("No se pudieron cargar los productos"));

        const fetchNumero = async () => {
            const numero = await cotizacionesService.obtenerUltimoNumero();
            setNumeroCotizacion(numero);
        };
        fetchNumero();
    }, []);

    const agregarProducto = (opcion) => {
        if (!opcion) return;
        const producto = productos.find(p => p.id === opcion.value);
        if (productosSeleccionados.some(p => p.id === producto.id)) {
            toast.warning("Este producto ya fue agregado");
            return;
        }
        setProductosSeleccionados([
            ...productosSeleccionados,
            { id: producto.id, nombre: producto.nombre, precio_venta: producto.precio_venta, cantidad: 1 },
        ]);
    };

    const actualizarProducto = (index, campo, valor) => {
        const nuevos = [...productosSeleccionados];
        nuevos[index][campo] = valor;
        setProductosSeleccionados(nuevos);
    };

    const eliminarProducto = (index) => {
        setProductosSeleccionados(productosSeleccionados.filter((_, i) => i !== index));
    };

    const subtotal = productosSeleccionados.reduce((acc, p) => acc + (p.precio_venta * p.cantidad), 0);

    const guardarCotizacion = async () => {
        try {
            await cotizacionesService.guardarCotizacion({
                numero_cotizacion: numeroCotizacion,
                fecha,
                cliente_id: clienteId,
                tipo,
                productos: productosSeleccionados
            });

            toast.success("Cotización guardada con éxito", {
                position: "top-center",
                autoClose: 2500,
                theme: "colored"
            });

            setNumeroCotizacion(numeroCotizacion + 1);
            setClienteId("");
            setTipo("");
            setProductosSeleccionados([]);
        } catch (error) {
            toast.error("Error al guardar la cotización", { position: "top-center" });
        }
    };

    const formatCOP = (value) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">📝 Nueva Cotización</h2>
            <ToastContainer />

            {/* Campos principales - apilados en móvil, grilla en desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                        className="border p-2 rounded-md w-full text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">N° Cotización</label>
                    <input
                        type="text"
                        placeholder="Número cotización"
                        value={numeroCotizacion}
                        onChange={e => setNumeroCotizacion(e.target.value)}
                        className="border p-2 rounded-md w-full text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                    <select
                        value={tipo}
                        onChange={e => {
                            const nuevoTipo = e.target.value;
                            setTipo(nuevoTipo);
                            if (nuevoTipo === "contado") {
                                const clienteDefault = clientes.find(c => c.nombre.includes("CUANTIAS MENORES"));
                                if (clienteDefault) setClienteId(clienteDefault.id);
                            }
                        }}
                        className="border p-2 rounded-md w-full text-sm"
                    >
                        <option value="">Seleccione tipo</option>
                        <option value="contado">Contado</option>
                        <option value="credito">Crédito</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
                    <select
                        value={clienteId}
                        onChange={e => setClienteId(e.target.value)}
                        className="border p-2 rounded-md w-full text-sm"
                    >
                        <option value="">Seleccione cliente</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>
            </div>

            <h3 className="text-base font-semibold mt-4 mb-2">Productos</h3>
            <Select
                options={productos.map(p => ({ value: p.id, label: `${p.nombre} - ${formatCOP(p.precio_venta)}` }))}
                onChange={agregarProducto}
                placeholder="🔍 Buscar producto..."
                className="text-sm"
            />

            <h3 className="text-base font-semibold mt-4 mb-2">Detalle Cotización</h3>

            {/* Tabla desktop */}
            <div className="hidden md:block overflow-x-auto mt-2">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <tr>
                            <th className="p-3 text-left text-sm">Producto</th>
                            <th className="p-3 text-center text-sm">Precio</th>
                            <th className="p-3 text-center text-sm">Cantidad</th>
                            <th className="p-3 text-center text-sm">Total</th>
                            <th className="p-3 text-center text-sm">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosSeleccionados.map((p, i) => (
                            <tr key={i} className="border-b hover:bg-blue-50 transition-colors">
                                <td className="p-3 text-sm">{p.nombre}</td>
                                <td className="p-3 text-center">
                                    <input
                                        type="text"
                                        value={formatCOP(p.precio_venta)}
                                        onChange={e => {
                                            const raw = e.target.value.replace(/[^0-9]/g, "");
                                            actualizarProducto(i, "precio_venta", parseInt(raw) || 0);
                                        }}
                                        className="w-32 border rounded px-2 py-1 text-center text-sm"
                                    />
                                </td>
                                <td className="p-3 text-center">
                                    <input
                                        type="number"
                                        value={p.cantidad}
                                        onChange={e => actualizarProducto(i, "cantidad", parseInt(e.target.value))}
                                        className="w-16 border rounded px-2 py-1 text-center text-sm"
                                    />
                                </td>
                                <td className="p-3 text-center font-semibold text-sm">
                                    {formatCOP(p.precio_venta * p.cantidad)}
                                </td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => eliminarProducto(i)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        ❌
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tarjetas móvil */}
            <div className="md:hidden space-y-3 mt-2">
                {productosSeleccionados.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">No hay productos agregados</p>
                )}
                {productosSeleccionados.map((p, i) => (
                    <div key={i} className="border rounded-lg p-3 bg-gray-50 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm text-gray-800 flex-1 pr-2">{p.nombre}</span>
                            <button
                                onClick={() => eliminarProducto(i)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs flex-shrink-0"
                            >
                                ❌
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Precio</label>
                                <input
                                    type="text"
                                    value={formatCOP(p.precio_venta)}
                                    onChange={e => {
                                        const raw = e.target.value.replace(/[^0-9]/g, "");
                                        actualizarProducto(i, "precio_venta", parseInt(raw) || 0);
                                    }}
                                    className="border rounded px-2 py-1 text-sm w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                                <input
                                    type="number"
                                    value={p.cantidad}
                                    onChange={e => actualizarProducto(i, "cantidad", parseInt(e.target.value))}
                                    className="border rounded px-2 py-1 text-sm w-full"
                                />
                            </div>
                        </div>
                        <div className="mt-2 text-right">
                            <span className="text-sm font-bold text-blue-600">
                                Total: {formatCOP(p.precio_venta * p.cantidad)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-3">
                <h3 className="text-base md:text-lg font-bold">
                    Subtotal: {formatCOP(subtotal)}
                </h3>
                <button
                    onClick={guardarCotizacion}
                    className="w-full sm:w-auto bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 font-medium"
                >
                    Guardar Cotización
                </button>
            </div>
        </div>
    );
}
