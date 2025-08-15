import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
export default function ListaCotizaciones() {
    const [cotizaciones, setCotizaciones] = useState([]);
    const navigate = useNavigate(); // Para redirigir

    useEffect(() => {
        axios.get("http://localhost:4000/api/cotizaciones")
            .then(res => setCotizaciones(res.data))
            .catch(err => console.error(err));
    }, []);

    const eliminarCotizacion = (id) => {
        if (window.confirm("¿Seguro que quieres eliminar esta cotización?")) {
            axios.delete(`http://localhost:4000/api/cotizaciones/${id}`)
                .then(() => {
                    toast.success("Cotización eliminada con éxito", {
                        position: "top-center",
                        autoClose: 2500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "colored"
                    });
                    setCotizaciones(cotizaciones.filter(c => c.id !== id));
                })
                .catch(err =>
                    toast.error("Error al eliminar la cotización", {
                        position: "top-center",
                        autoClose: 2500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "colored"
                    })
                )
        }
    };

    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">📄 Lista de Cotizaciones</h2>
            <ToastContainer />
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full border-collapse bg-white">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <tr>
                            <th className="p-3 text-left">N° Cotización</th>
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-right">Subtotal</th>
                            <th className="p-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotizaciones.map((c) => (
                            <tr
                                key={c.id}
                                className="border-b hover:bg-blue-50 transition-colors"
                            >
                                <td className="p-3">{c.numero_cotizacion}</td>
                                <td className="p-3">{c.cliente}</td>
                                <td className="p-3 text-right font-semibold">${parseFloat(c.subtotal).toFixed(2)}</td>
                                <td className="p-3 text-center space-x-2">
                                    <button
                                        onClick={() => navigate(`/editar-cotizacion/${c.id}`)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-sm transition"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => eliminarCotizacion(c.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition"
                                    >
                                        ❌ Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
