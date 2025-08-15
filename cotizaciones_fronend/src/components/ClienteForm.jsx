import React, { useState, useEffect } from "react";

const ClienteForm = ({ cliente, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    telefono: "",
    municipio: "",
  });

  const [filtroMunicipio, setFiltroMunicipio] = useState("");

  const municipios = [
    "Florencia",
    "Morelia",
    "Belen",
    "San Jose",
    "Yurayaco",
    "La montañita",
    "Paujil",
    "Puerto Rico",
    "San Vicente del Caguan",
    "Cartagena del Chaira",
  ];

  useEffect(() => {
    if (cliente) {
      setFormData({
        id: cliente.id || "",
        cedula: cliente.cedula || "",
        nombre: cliente.nombre || "",
        telefono: cliente.telefono || "",
        municipio: cliente.municipio || "",
      });
    } else {
      setFormData({
        id: "",
        cedula: "",
        nombre: "",
        telefono: "",
        municipio: "",
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const municipiosFiltrados = municipios.filter((m) =>
    m.toLowerCase().includes(filtroMunicipio.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {cliente ? "Editar Cliente" : "Nuevo Cliente"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="Cédula"
            className="border p-2 w-full mb-2"
            required
          />
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
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            className="border p-2 w-full mb-2"
          />

          <select
            name="municipio"
            value={formData.municipio}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          >
            <option value="">Seleccione un municipio</option>
            {municipiosFiltrados.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>

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

export default ClienteForm;
