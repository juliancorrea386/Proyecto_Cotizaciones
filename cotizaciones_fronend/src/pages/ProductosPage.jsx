import React, { useEffect, useState } from "react";
import productosSerive from "../services/productosService";
import ProductoForm from "../components/ProductoForm";
export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nombreProducto, setNombreProducto] = useState("");
  const [referencia, setReferencia] = useState("");
  // ✅ Definir fetchData fuera del useEffect

  const fetchData = async (params = {}) => {
    try {
      const data = await productosSerive.listar(params);
      setProductos(data);
    } catch (err) {
      console.error("Error al obtener productos:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const aplicarFiltros = () => {
    const params = {};
    if (nombreProducto) params.nombreProducto = nombreProducto;
    if (referencia) params.referencia = referencia; 
    fetchData(params);
  };

  const limpiarFiltros = () => {
    setNombreProducto("");  
    setReferencia("");
    fetchData();
  };


  const handleCreate = () => {
    setProductoSeleccionado(null); // Crear nuevo
    setShowForm(true);
  };

  const handleEdit = (producto) => {
    setProductoSeleccionado(producto); // Editar existente
    setShowForm(true);
  };
  const productoParaEnviar = (producto) => ({
    referencia: producto.Referencia,
    nombre: producto.nombre,
    precio_costo: Number(producto.precio_costo),
    precio_venta: Number(producto.precio_venta),
    iva: producto.iva,        // ya está en el formato correcto ('0%','5%','19%')
    embalaje: producto.embalaje,
    stock: Number(producto.stock),
  });

  const guardarProducto = async (producto) => {
    if (producto.id) {
      // Editar cliente
      await productosSerive.actualizar(producto.id, producto);
    } else {
      // Nuevo cliente
      await productosSerive.crear(productoParaEnviar(producto));
    }
    fetchData();
    cerrarModal();
  };
  const cerrarModal = () => {
    setShowForm(false);
    setProductoSeleccionado(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      await productosSerive.eliminar(id);
      fetchData();
    }
  };

  return (
    <div className="mt-6">
      <h1 className="text-xl font-bold mb-4">Lista de Productos</h1>

      <button
        onClick={handleCreate}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Nuevo Producto
      </button>
      <div className="bg-white p-4 rounded-lg shadow mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                <div>
                    <label className="block text-gray-700">Nombre Producto:</label>
                    <input
                        type="text"
                        placeholder="Nombre Producto"
                        value={nombreProducto}
                        onChange={(e) => setNombreProducto(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Referencia:</label>
                    <input
                        type="text"
                        placeholder="Referencia"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
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
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr >
              <th className="border p-2">Referencia</th>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Precio Costo</th>
              <th className="border p-2">Precio Venta</th>
              <th className="border p-2">IVA</th>
              <th className="border p-2">Embalaje</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length > 0 ? (
              productos.map((producto) => (
                <tr key={producto.id}>
                  <td className="border p-2">{producto.Referencia}</td>
                  <td className="border p-2">{producto.nombre}</td>
                  <td className="border p-2">{new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(producto.precio_costo)}</td>
                  <td className="border p-2">{new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(producto.precio_venta)}</td>
                  <td className="border p-2">{producto.iva}</td>
                  <td className="border p-2">{producto.embalaje}</td>
                  <td className="border p-2">{producto.stock}</td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(producto)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-sm transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(producto.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition"
                    >
                      ❌ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No hay productos</td>
              </tr>
            )}
          </tbody>
        </table>
        {showForm && (
          <ProductoForm
            producto={productoSeleccionado} // Ahora sí se pasa el cliente correcto
            onSave={guardarProducto}
            onClose={cerrarModal}
          />
        )}
      </div>
    </div>
  );
}
