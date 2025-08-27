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

            // Redirigir según rol
            if (res.role === "admin") {
                navigate("/cotizaciones");
            } else {
                navigate("/clientes"); // 👈 si ambos van a la misma
            }

        } catch (err) {
            console.error("Error en login:", err);
            setError("Ocurrió un error");
            alert("Usuario o contraseña incorrectos");
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-xl font-bold mb-4 text-center">Iniciar Sesión</h2>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario"
                    className="w-full px-3 py-2 mb-3 border rounded"
                    required
                />

                <input
                    type="password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-3 py-2 mb-3 border rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >Ingresar</button>
            </form>
        </div>
    );
}
