import React, { useState, useEffect } from "react";
import ClienteForm from "../components/ClienteForm";
import clientesService from "../services/clientesService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const data = await clientesService.listar();
            setClientes(data);
        } catch (err) {
            console.error("Error al obtener productos:", err);
        }
    };

    const handleCreate = () => {
        setClienteSeleccionado(null); // Crear nuevo
        setShowForm(true);
    };

    const handleEdit = (cliente) => {
        setClienteSeleccionado(cliente); // Editar existente
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este producto?")) {
            await clientesService.eliminar(id);
            fetchClientes();
            toast.success("Cotización eliminada con éxito", {
                position: "top-center",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored"
            });
        }
    };

    const guardarCliente = async (cliente) => {
        try {
            const clienteExistente = clientes.find(c => c.id === cliente.id);
            if (clienteExistente) {
                await clientesService.actualizar(cliente.id, cliente);
                toast.success("cliente editado con éxito", {
                    position: "top-center",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored"
                });
            } else {
                await clientesService.crear(cliente);
                toast.success("cliente guardado con éxito", {
                    position: "top-center",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored"
                });
            }
            await fetchClientes();
        } catch (error) {
        }
        cerrarModal();
    };

    const cerrarModal = () => {
        setShowForm(false);
        setClienteSeleccionado(null);
    };

    return (
        <div className="mt-6">
            <h1 className="text-xl font-bold mb-4">📄 Lista de Clientes</h1>
            <ToastContainer />
            <button
                onClick={handleCreate}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
                Nuevo Cliente
            </button>
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <tr >
                            <th className="p-3 text-left">Cédula</th>
                            <th className="p-3 text-left">Nombre</th>
                            <th className="p-3 text-left">Teléfono</th>
                            <th className="p-3 text-left">Municipio</th>
                            <th className="p-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map((c) => (
                            <tr key={c.id}
                                className="border-b hover:bg-blue-50 transition-colors"
                            >
                                <td className="p-3">{c.id}</td>
                                <td className="p-3">{c.nombre}</td>
                                <td className="p-3">{c.telefono}</td>
                                <td className="p-3">{c.municipio}</td>
                                <td className="p-3 text-center space-x-2">
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
                    <ClienteForm
                        cliente={clienteSeleccionado} // Ahora sí se pasa el cliente correcto
                        onSave={guardarCliente}
                        onClose={cerrarModal}
                    />
                )}
            </div>
        </div>
    );
}
