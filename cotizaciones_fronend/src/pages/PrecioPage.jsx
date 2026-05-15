import React, { useEffect, useState } from "react";
import productosService from "../services/productosService";

export default function PrecioPage() {
    const [productos, setProductos] = useState([]);
    const [nombreProducto, setNombreProducto] = useState("");

    const fetchPrecios = async () => {
        const data = await productosService.listarPrecios();
        setProductos(data);
    };

    useEffect(() => {
        fetchPrecios();
    }, []);

    const formatearCOP = (valor) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(valor || 0);
    };

    const handlePrecioChange = (id, nuevoPrecio) => {
        setProductos((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, precio_venta: nuevoPrecio } : p
            )
        );
    };

    const guardarPrecio = async (id, precio) => {
        try {
            await productosService.actualizarPrecio(id, Number(precio));
            alert("Precio actualizado correctamente ✅");
            fetchPrecios();
        } catch (error) {
            alert("Error al actualizar el precio ❌");
        }
    };

    const buscarPorNombre = async () => {
        const data = await productosService.listarPrecios({ nombreProducto });
        setProductos(data);
    };

    const limpiarBusqueda = async () => {
        setNombreProducto("");
        fetchPrecios();
    };

    return (
        <div className="mt-4 px-2 sm:px-4 md:px-6">
            <h1 className="text-xl font-bold mb-4">Actualizar Precios</h1>

            {/* Buscador */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={nombreProducto}
                    onChange={(e) => setNombreProducto(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarPorNombre()}
                    className="border px-3 py-2 rounded w-full sm:w-64 text-sm"
                />
                <div className="flex gap-2">
                    <button
                        onClick={buscarPorNombre}
                        className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-sm"
                    >
                        🔍 Buscar
                    </button>
                    <button
                        onClick={limpiarBusqueda}
                        className="flex-1 sm:flex-none bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition text-sm"
                    >
                        ❌ Limpiar
                    </button>
                </div>
            </div>

            {/* TABLA — visible en md+ */}
            <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="border p-2 text-sm">ID</th>
                            <th className="border p-2 text-sm">Nombre</th>
                            <th className="border p-2 text-sm">Precio Venta</th>
                            <th className="border p-2 text-sm">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((producto) => (
                            <tr key={producto.id} className="hover:bg-gray-50">
                                <td className="border p-2 text-sm">{producto.id}</td>
                                <td className="border p-2 text-sm">{producto.nombre}</td>
                                <td className="border p-2">
                                    <input
                                        type="text"
                                        value={formatearCOP(producto.precio_venta)}
                                        onChange={(e) => {
                                            const valorLimpio = e.target.value.replace(/\D/g, "");
                                            handlePrecioChange(producto.id, valorLimpio);
                                        }}
                                        className="border px-2 py-1 rounded w-full text-right text-sm"
                                    />
                                </td>
                                <td className="border p-2">
                                    <button
                                        onClick={() => guardarPrecio(producto.id, producto.precio_venta)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition text-sm"
                                    >
                                        💾 Guardar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {productos.length === 0 && (
                    <p className="p-4 text-center text-gray-500">No hay productos</p>
                )}
            </div>

            {/* TARJETAS — visible solo en móvil */}
            <div className="md:hidden flex flex-col gap-3">
                {productos.length > 0 ? (
                    productos.map((producto) => (
                        <div
                            key={producto.id}
                            className="bg-white rounded-lg shadow p-4 border border-gray-100"
                        >
                            <div className="mb-3">
                                <p className="font-semibold text-gray-800 text-base">{producto.nombre}</p>
                                <p className="text-xs text-gray-400">ID: {producto.id}</p>
                            </div>

                            <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Precio Venta
                                </label>
                                <input
                                    type="text"
                                    value={formatearCOP(producto.precio_venta)}
                                    onChange={(e) => {
                                        const valorLimpio = e.target.value.replace(/\D/g, "");
                                        handlePrecioChange(producto.id, valorLimpio);
                                    }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <button
                                onClick={() => guardarPrecio(producto.id, producto.precio_venta)}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition text-sm font-medium"
                            >
                                💾 Guardar
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No hay productos</p>
                )}
            </div>
        </div>
    );
}