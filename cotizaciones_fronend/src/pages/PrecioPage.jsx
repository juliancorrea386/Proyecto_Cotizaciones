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
        const data = await productosService.listarPrecios({
            nombreProducto
        });
        setProductos(data);
    };
    const limpiarBusqueda = async () => {
        setNombreProducto("");
        fetchPrecios();
    };

    return (
        <div className="mt-6">
            <h1 className="text-xl font-bold mb-4">Actualizar Precios</h1>
            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={nombreProducto}
                    onChange={(e) => setNombreProducto(e.target.value)}
                    className="border px-3 py-2 rounded w-64"
                />

                <button
                    onClick={buscarPorNombre}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    🔍 Buscar
                </button>

                <button
                    onClick={limpiarBusqueda}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                    ❌ Limpiar
                </button>
            </div>
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="border p-2">ID</th>
                            <th className="border p-2">Nombre</th>
                            <th className="border p-2">Precio Venta</th>
                            <th className="border p-2">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((producto) => (
                            <tr key={producto.id}>
                                <td className="border p-2">{producto.id}</td>
                                <td className="border p-2">{producto.nombre}</td>
                                <td className="border p-2">
                                    <input
                                        type="text"
                                        value={formatearCOP(producto.precio_venta)}
                                        onChange={(e) => {
                                            const valorLimpio = e.target.value.replace(/\D/g, "");
                                            handlePrecioChange(producto.id, valorLimpio);
                                        }}
                                        className="border px-2 py-1 rounded w-full text-right"
                                    />
                                </td>
                                <td className="border p-2">
                                    <button
                                        onClick={() =>
                                            guardarPrecio(producto.id, producto.precio_venta)
                                        }
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                                    >
                                        💾 Guardar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {productos.length === 0 && (
                    <p className="p-4 text-center">No hay productos</p>
                )}
            </div>
        </div>
    );
}