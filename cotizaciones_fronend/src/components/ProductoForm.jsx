import React, { useState, useEffect } from "react";

const ProductoForm = ({ producto, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    precio_costo: "",
    precio_venta: "",
    iva: "",
    embalaje: "",
    stock: "",
  });

  const [filtroIva, setFiltroIva] = useState("");
  const [filtroEmbalaje, setFiltroEmbalaje] = useState("");
  const iva = [
    "0%",
    "5%",
    "19%",
  ];

  const embalaje = [
    "Frasco",
    "Galón",
    "Bolsa",
  ];

  useEffect(() => {
    if (producto) {
      setFormData(producto);
      setFiltroIva(""); // Resetea búsqueda al editar
      setFiltroEmbalaje(""); // Resetea búsqueda al editar
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

  const IvaFiltrados = iva.filter((m) =>
    m.toLowerCase().includes(filtroIva.toLowerCase())
  );

  const EmbalajeFiltrados = embalaje.filter((m) =>
    m.toLowerCase().includes(filtroEmbalaje.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {producto ? "Editar Cliente" : "Nuevo Cliente"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="border p-2 w-full mb-2"
            required
          />
          <input
            type="text"
            name="precio_costo"
            value={formData.precio_costo}
            onChange={handleChange}
            placeholder="Precio Costo"
            className="border p-2 w-full mb-2"
          />
          <input
            type="text"
            name="precio_venta"
            value={formData.precio_venta}
            onChange={handleChange}
            placeholder="Precio Venta"
            className="border p-2 w-full mb-2"
          />
          {/* Select de iva */}
          <select
            name="iva"
            value={formData.iva}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          >
            <option value="">Seleccione Iva</option>
            {IvaFiltrados.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>
          {/* Select de embalaje */}
          <select
            name="embalaje"
            value={formData.embalaje}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          >
            <option value="">Seleccione embalaje</option>
            {EmbalajeFiltrados.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="stock"
            className="border p-2 w-full mb-2"
          />
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoForm;
