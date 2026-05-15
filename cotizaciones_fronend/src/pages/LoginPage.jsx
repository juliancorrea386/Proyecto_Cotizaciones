import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await authService.login(username, password);
            localStorage.setItem("user_id", res.id);
            localStorage.setItem("username", res.username);
            localStorage.setItem("role", res.role);
            // Redirigir según rol
            if (res.role === "admin") {
                navigate("/cotizaciones");
            } else {
                navigate("/cotizaciones"); // 👈 si ambos van a la misma
            }

        } catch (err) {
            console.error("Error en login:", err);
            setError("Ocurrió un error");
            alert("Usuario o contraseña incorrectos");
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <form
                onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96">

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
                    <p className="text-gray-500 text-sm">Bienvenido de nuevo 👋</p>
                </div>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario"
                    className="w-full px-4 py-2 mb-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    required
                />

                <input
                    type="password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-4 py-2 mb-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-xl shadow-md hover:scale-105 transition"
                >Ingresar</button>
            </form>
        </div>
    );
}
