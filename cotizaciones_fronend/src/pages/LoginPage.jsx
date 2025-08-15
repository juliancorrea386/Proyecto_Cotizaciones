import React, { useState } from "react";
import axios from "axios";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:4000/api/auth/login", {
                username,
                password,
            });

            console.log("Respuesta del backend:", res.data);

            // Guardar token y usuario en localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            // Redirigir según rol
            if (res.data.user.role === "admin") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/dashboard";
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
