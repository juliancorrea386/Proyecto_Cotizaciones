import React, { useState, useEffect } from "react";
import ClienteForm from "../components/ClienteForm";
import clientesService from "../services/clientesService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [nombreCliente, setnombreCliente] = useState("");
    const [cedula, setCedula] = useState("");
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async (params = {}) => {
        try {
            const data = await clientesService.listar(params);
            setClientes(data);
        } catch (err) {
            console.error("Error al obtener clientes:", err);
        }
    };

    const aplicarFiltros = () => {
        const params = {};
        if (nombreCliente) params.nombreCliente = nombreCliente;
        if (cedula) params.cedula = cedula;
        fetchClientes(params);
        setFiltrosAbiertos(false);
    };

    const limpiarFiltros = () => {
        setnombreCliente("");
        setCedula("");
        fetchClientes();
    };

    const handleCreate = () => {
        setClienteSeleccionado(null);
        setShowForm(true);
    };

    const handleEdit = (cliente) => {
        setClienteSeleccionado(cliente);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
            await clientesService.eliminar(id);
            fetchClientes();
            toast.success("Cliente eliminado con éxito", {
                position: "top-center",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
        }
    };

    const guardarCliente = async (cliente) => {
        try {
            const clienteExistente = clientes.find((c) => c.id === cliente.id);
            if (clienteExistente) {
                await clientesService.actualizar(cliente.id, cliente);
                toast.success("Cliente editado con éxito", {
                    position: "top-center", autoClose: 2500, hideProgressBar: false,
                    closeOnClick: true, pauseOnHover: true, draggable: true, theme: "colored",
                });
            } else {
                await clientesService.crear(cliente);
                toast.success("Cliente guardado con éxito", {
                    position: "top-center", autoClose: 2500, hideProgressBar: false,
                    closeOnClick: true, pauseOnHover: true, draggable: true, theme: "colored",
                });
            }
            await fetchClientes();
        } catch (error) {
            console.error("Error guardando cliente:", error);
        }
        cerrarModal();
    };

    const cerrarModal = () => {
        setShowForm(false);
        setClienteSeleccionado(null);
    };

    return (
        <div className="mt-4 px-3 sm:px-0">
            <h1 className="text-xl font-bold mb-4">📄 Lista de Clientes</h1>
            <ToastContainer />

            <button
                onClick={handleCreate}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4 w-full sm:w-auto text-sm"
            >
                + Nuevo Cliente
            </button>

            {/* Filtros colapsables en móvil */}
            <div className="mb-4">
                <button
                    onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                    className="sm:hidden w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded shadow flex justify-between items-center text-sm"
                >
                    <span>🔎 Filtros</span>
                    <span>{filtrosAbiertos ? "▲" : "▼"}</span>
                </button>

                <div className={`bg-white p-4 rounded-lg shadow mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end ${filtrosAbiertos ? "grid" : "hidden sm:grid"}`}>
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Nombre:</label>
                        <input
                            type="text"
                            placeholder="Nombre cliente"
                            value={nombreCliente}
                            onChange={(e) => setnombreCliente(e.target.value)}
                            className="border px-3 py-2 rounded w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Cédula:</label>
                        <input
                            type="text"
                            placeholder="Cédula cliente"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            className="border px-3 py-2 rounded w-full text-sm"
                        />
                    </div>
                    <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                        <button
                            onClick={aplicarFiltros}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow w-full text-sm"
                        >
                            🔍 Filtrar
                        </button>
                        <button
                            onClick={limpiarFiltros}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow w-full text-sm"
                        >
                            ❌ Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Vista de tabla en desktop, tarjetas en móvil */}
            <div className="hidden sm:block overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <tr>
                            <th className="p-3 text-left text-sm">Cédula</th>
                            <th className="p-3 text-left text-sm">Nombre</th>
                            <th className="p-3 text-left text-sm">Teléfono</th>
                            <th className="p-3 text-left text-sm">Municipio</th>
                            <th className="p-3 text-center text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map((c) => (
                            <tr key={c.id} className="border-b hover:bg-blue-50 transition-colors">
                                <td className="p-3 text-sm">{c.id}</td>
                                <td className="p-3 text-sm">{c.nombre}</td>
                                <td className="p-3 text-sm">{c.telefono}</td>
                                <td className="p-3 text-sm">{c.municipio}</td>
                                <td className="p-3 text-center space-x-2">
                                    <button
                                        onClick={() => handleEdit(c)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-sm transition text-sm"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition text-sm"
                                    >
                                        ❌ Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tarjetas para móvil */}
            <div className="sm:hidden space-y-3">
                {clientes.map((c) => (
                    <div key={c.id} className="bg-white rounded-lg shadow border p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-semibold text-gray-800">{c.nombre}</p>
                                <p className="text-xs text-gray-500">CC: {c.id}</p>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {c.municipio}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">📞 {c.telefono || "Sin teléfono"}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(c)}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded text-sm font-medium"
                            >
                                ✏️ Editar
                            </button>
                            <button
                                onClick={() => handleDelete(c.id)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm font-medium"
                            >
                                ❌ Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {clientes.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No hay clientes registrados.</p>
            )}

            {showForm && (
                <ClienteForm
                    cliente={clienteSeleccionado}
                    onSave={guardarCliente}
                    onClose={cerrarModal}
                />
            )}
        </div>
    );
}