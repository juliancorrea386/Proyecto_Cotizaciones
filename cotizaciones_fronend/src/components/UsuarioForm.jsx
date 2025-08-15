import React, { useState, useEffect } from "react";

const UsuarioForm = ({ usuario, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    role: "",
  });

  const [filtroRol, setFiltroRol] = useState("");

  const rol = [
    "admin",
    "user",
  ];

  useEffect(() => {
    if (usuario) {
      setFormData({
        id: usuario.id || "",
        username: usuario.username || "",
        password: "",
        role: usuario.role || "",
      });
    } else {
      setFormData({
        id: "",
        username: "",
        password: "",
        role: "",
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const RolFiltrados = rol.filter((m) =>
    m.toLowerCase().includes(filtroRol.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {usuario ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="username"
            className="border p-2 w-full mb-2"
            required
          />
          <input
            type="text"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="password"
            className="border p-2 w-full mb-2"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          >
            <option value="">Seleccione Rol</option>
            {RolFiltrados.map((m, i) => (
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

export default UsuarioForm;
