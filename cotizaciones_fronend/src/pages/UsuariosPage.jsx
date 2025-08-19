import React, { useState, useEffect } from "react";
import UsuarioForm from "../components/UsuarioForm";
//import { getCliente, createCliente, updateCliente, deleteCliente } from "../services/clientesService";
import { getUsuario, createUsuario, updateUsuario, deleteUsuario } from "../services/usuariosService";
export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const data = await getUsuario();
            setUsuarios(data);
        } catch (err) {
            console.error("Error al obtener productos:", err);
        }
    };

    const handleCreate = () => {
        setUsuarioSeleccionado(null); // Crear nuevo
        setShowForm(true);
    };

    const handleEdit = (usuario) => {
        setUsuarioSeleccionado(usuario); // Editar existente
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este producto?")) {
            await deleteUsuario(id);
            fetchClientes();
        }
    };

    const guardarUsuario = async (usuario) => {
        // Verifica los datos del usuario
        try {
            const clienteExistente = usuarios.find(c => c.id === usuario.id);
            if (clienteExistente) {
                await updateUsuario(usuario.id, usuario);
            } else {
                await createUsuario(usuario);
            }
            await fetchClientes();
        } catch (error) {
        }
        cerrarModal();
    };

    const cerrarModal = () => {
        setShowForm(false);
        setUsuarioSeleccionado(null);
    };

    return (
        <div className="mt-6">
            <h1 className="text-xl font-bold mb-4">Lista de Usuarios</h1>
            <button
                onClick={handleCreate}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
                Nuevo Usuario
            </button>
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <tr >
                            <th className="border p-2">Id</th>
                            <th className="border p-2">Nombre</th>
                            <th className="border p-2">Rol</th>
                            <th className="border p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((c) => (
                            <tr key={c.id}>
                                <td className="border p-2">{c.id}</td>
                                <td className="border p-2">{c.username}</td>
                                <td className="border p-2">{c.role}</td>
                                <td className="border p-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(c)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-sm transition"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition"
                                    >
                                        ❌ Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {showForm && (
                    <UsuarioForm
                        usuario={usuarioSeleccionado} // Ahora sí se pasa el usuario correcto
                        onSave={guardarUsuario}
                        onClose={cerrarModal}
                    />
                )}
            </div>
        </div>
    );
}
