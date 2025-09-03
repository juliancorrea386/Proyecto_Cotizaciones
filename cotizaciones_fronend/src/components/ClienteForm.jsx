import React, { useState, useEffect } from "react";
import municipiosService from "../services/municipiosService";
const ClienteForm = ({ cliente, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    telefono: "",
    municipio: "",
  });
  const [municipios, setMunicipios] = useState([]);


  useEffect(() => {
    try {
      const fetchMunicipios = async () => {
        const data = await municipiosService.getMunicipios();
        setMunicipios(data);
      };
      fetchMunicipios();
    } catch (err) {
      console.error("Error al obtener municipios:", err);
    }
  }, []);

  useEffect(() => {
    if (cliente) {
      setFormData({
        id: cliente.id || "",
        cedula: cliente.cedula || "",
        nombre: cliente.nombre || "",
        telefono: cliente.telefono || "",
        municipio: cliente.municipio_id ? String(cliente.municipio_id) : "",
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
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
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
