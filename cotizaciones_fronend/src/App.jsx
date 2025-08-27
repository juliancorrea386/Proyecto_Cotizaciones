// App.jsx
// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ProductosPage from "./pages/ProductosPage";
import ClientesPage from "./pages/ClientesPage";
import LoginPage from "./pages/LoginPage";
import UsuariosPage from "./pages/UsuariosPage";
import Cotizaciones from "./pages/Cotizaciones";
import ListaCotizaciones from "./pages/ListaCotizaciones";
import EditarCotizaciones from "./pages/EditarCotizacion";
import ReporteInvPage from "./pages/reporteInvPage";
import RecibosPage from "./pages/RecibosPage";
import ListaRecibos from "./pages/ListaRecibos";
import EditarRecibos from "./pages/EditarRecibos";
import MovimientosPage from "./pages/MovimientosPage";
import ReporteVentasPage from "./pages/ReporteVentasPage";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Barra de navegación */}
      <div className="bg-white shadow p-4 flex gap-4">
        <Link to="/clientes" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Clientes</Link>
        <Link to="/productos" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Productos</Link>
        <Link to="/cotizaciones" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Cotizaciones</Link>
        <Link to="/lista-cotizaciones" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Lista Cotizaciones</Link>
        <Link to="/usuarios" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Usuarios</Link>
        <Link to="/reporte-inventario" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Reporte Inventario</Link>
        <Link to="/recibos" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Recibos</Link>
        <Link to="/lista-recibos" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Lista Recibos</Link>
        <Link to="/movimientos" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Movimientos</Link>
        <Link to="/reporte-ventas" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white">Reporte Ventas</Link>

        {/* Botón de cerrar sesión */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login"; // 👈 redirige al login
          }}
          className="ml-auto bg-red-500 text-white px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Contenido principal */}
      <div className="p-4">
        <Routes>
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/lista-cotizaciones" element={<ListaCotizaciones />} />
          <Route path="/editar-cotizacion/:id" element={<EditarCotizaciones />} />
          <Route path="/reporte-inventario" element={<ReporteInvPage />} />
          <Route path="/recibos" element={<RecibosPage />} />
          <Route path="/lista-recibos" element={<ListaRecibos />} />
          <Route path="/editar-recibo/:id" element={<EditarRecibos />} />
          <Route path="/movimientos" element={<MovimientosPage />} />
          <Route path="/reporte-ventas" element={<ReporteVentasPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
