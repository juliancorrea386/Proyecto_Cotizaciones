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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end sm:items-center z-50 p-0 sm:p-4">
      {/* En móvil se abre desde abajo (sheet), en desktop centrado */}
      <div className="bg-white w-full sm:w-96 sm:rounded-lg rounded-t-2xl p-5 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Indicador de arrastre solo en móvil */}
        <div className="sm:hidden flex justify-center mb-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {cliente ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cédula *</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="Número de cédula"
              className="border p-3 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="border p-3 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Número de teléfono"
              className="border p-3 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Municipio</label>
            <select
              name="municipio"
              value={formData.municipio}
              onChange={handleChange}
              className="border p-3 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">Seleccione un municipio</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-sm font-medium transition"
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