import React, { useState, useEffect } from "react";

const ProductoForm = ({ producto, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    Referencia: "",
    nombre: "",
    precio_costo: "",
    precio_venta: "",
    iva: "",
    embalaje: "",
    stock: "",
  });

  const ivaOpciones = ["0%", "5%", "19%"];

  const embalajeOpciones = [
    "Frasco", "Galón", "Bolsa", "Unidad", "Bidón", "Bulto",
    "Kilos", "Caja", "Bloque", "Libra", "Balde", "Manga",
    "CUBETA", "Barra",
  ];

  useEffect(() => {
    if (producto) {
      setFormData(producto);
    }
  }, [producto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    /* Overlay */
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end sm:items-center z-50 px-0 sm:px-4">
      {/* Panel: ocupa toda la pantalla en móvil, modal centrado en sm+ */}
      <div className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-2xl shadow-xl flex flex-col max-h-[92vh]">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {producto ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Formulario scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-3">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referencia *</label>
            <input
              type="text"
              name="Referencia"
              value={formData.Referencia}
              onChange={handleChange}
              placeholder="Ej: PROD-001"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre del producto"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Precios en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Costo</label>
              <input
                type="number"
                name="precio_costo"
                value={formData.precio_costo}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
              <input
                type="number"
                name="precio_venta"
                value={formData.precio_venta}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* IVA y Stock en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IVA</label>
              <select
                name="iva"
                value={formData.iva}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">Seleccione</option>
                {ivaOpciones.map((m, i) => (
                  <option key={i} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Embalaje</label>
            <select
              name="embalaje"
              value={formData.embalaje}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">Seleccione embalaje</option>
              {embalajeOpciones.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>

        </form>

        {/* Pie fijo con botones */}
        <div className="px-5 py-4 border-t flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition text-sm"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoForm;