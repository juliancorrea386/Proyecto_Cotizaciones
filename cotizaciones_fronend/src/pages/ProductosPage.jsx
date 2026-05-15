import React, { useEffect, useState } from "react";
import productosSerive from "../services/productosService";
import ProductoForm from "../components/ProductoForm";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nombreProducto, setNombreProducto] = useState("");
  const [referencia, setReferencia] = useState("");

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
    setProductoSeleccionado(null);
    setShowForm(true);
  };

  const handleEdit = (producto) => {
    setProductoSeleccionado(producto);
    setShowForm(true);
  };

  const productoParaEnviar = (producto) => ({
    referencia: producto.Referencia,
    nombre: producto.nombre,
    precio_costo: Number(producto.precio_costo),
    precio_venta: Number(producto.precio_venta),
    iva: producto.iva,
    embalaje: producto.embalaje,
    stock: Number(producto.stock),
  });

  const guardarProducto = async (producto) => {
    if (producto.id) {
      await productosSerive.actualizar(producto.id, producto);
    } else {
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

  const formatCOP = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

  return (
    <div className="mt-4 px-2 sm:px-4 md:px-6">
      <h1 className="text-xl font-bold mb-4">Lista de Productos</h1>

      {/* Botón nuevo producto */}
      <button
        onClick={handleCreate}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 w-full sm:w-auto transition"
      >
        + Nuevo Producto
      </button>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="block text-gray-700 text-sm mb-1">Nombre Producto:</label>
          <input
            type="text"
            placeholder="Nombre Producto"
            value={nombreProducto}
            onChange={(e) => setNombreProducto(e.target.value)}
            className="border px-3 py-2 rounded w-full text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 text-sm mb-1">Referencia:</label>
          <input
            type="text"
            placeholder="Referencia"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="border px-3 py-2 rounded w-full text-sm"
          />
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <button
            onClick={aplicarFiltros}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow flex-1 sm:flex-none text-sm transition"
          >
            🔍 Filtrar
          </button>
          <button
            onClick={limpiarFiltros}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow flex-1 sm:flex-none text-sm transition"
          >
            ❌ Limpiar
          </button>
        </div>
      </div>

      {/* Vista de tabla en desktop, tarjetas en móvil */}

      {/* --- TABLA (visible en md y superior) --- */}
      <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th className="border p-2 text-sm">Referencia</th>
              <th className="border p-2 text-sm">Nombre</th>
              <th className="border p-2 text-sm">Precio Costo</th>
              <th className="border p-2 text-sm">Precio Venta</th>
              <th className="border p-2 text-sm">IVA</th>
              <th className="border p-2 text-sm">Embalaje</th>
              <th className="border p-2 text-sm">Stock</th>
              <th className="border p-2 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length > 0 ? (
              productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="border p-2 text-sm">{producto.Referencia}</td>
                  <td className="border p-2 text-sm">{producto.nombre}</td>
                  <td className="border p-2 text-sm">{formatCOP(producto.precio_costo)}</td>
                  <td className="border p-2 text-sm">{formatCOP(producto.precio_venta)}</td>
                  <td className="border p-2 text-sm">{producto.iva}</td>
                  <td className="border p-2 text-sm">{producto.embalaje}</td>
                  <td className="border p-2 text-sm">{producto.stock}</td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-sm transition text-sm"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition text-sm"
                      >
                        ❌ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No hay productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- TARJETAS (visible en móvil, oculto en md+) --- */}
      <div className="md:hidden flex flex-col gap-3">
        {productos.length > 0 ? (
          productos.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-100"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800 text-base">{producto.nombre}</p>
                  <p className="text-xs text-gray-500">Ref: {producto.Referencia}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                  {producto.iva}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 mb-3">
                <div>
                  <span className="text-gray-400 text-xs">Precio Costo</span>
                  <p className="font-medium">{formatCOP(producto.precio_costo)}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Precio Venta</span>
                  <p className="font-medium">{formatCOP(producto.precio_venta)}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Embalaje</span>
                  <p className="font-medium">{producto.embalaje}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Stock</span>
                  <p className="font-medium">{producto.stock}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(producto)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded shadow-sm transition text-sm"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(producto.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded shadow-sm transition text-sm"
                >
                  ❌ Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">No hay productos</p>
        )}
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <ProductoForm
          producto={productoSeleccionado}
          onSave={guardarProducto}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
}