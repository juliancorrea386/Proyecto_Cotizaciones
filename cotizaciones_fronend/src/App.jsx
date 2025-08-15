// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import ProductosPage from "./pages/ProductosPage";
import ClientesPage from "./pages/ClientesPage";
import LoginPage from "./pages/LoginPage";
import UsuariosPage from "./pages/UsuariosPage";
import Cotizaciones from "./pages/Cotizaciones";
import ListaCotizaciones from "./pages/ListaCotizaciones";
import EditarCotizaciones from "./pages/EditarCotizacion";

function AppContent() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => navigate("/clientes")} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white shadow p-4 flex gap-4">
        <Link to="/clientes" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Clientes</Link>
        <Link to="/productos" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Productos</Link>
        <Link to="/cotizaciones" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Cotizaciones</Link>
        <Link to="/lista-cotizaciones" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Lista Cotizaciones</Link>
        <Link to="/usuarios" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Usuarios</Link>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="ml-auto bg-red-500 text-white px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="p-4">
        <Routes>
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/lista-cotizaciones" element={<ListaCotizaciones />} />
          <Route path="/editar-cotizacion/:id" element={<EditarCotizaciones />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}
