// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
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
import CarteraPage from "./pages/CarteraPage";
import { Navigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const links = [
    { to: "/clientes", label: "Clientes" },
    { to: "/productos", label: "Productos" },
    { to: "/cotizaciones", label: "Cotizaciones" },
    { to: "/lista-cotizaciones", label: "Lista Cotizaciones" },
    { to: "/usuarios", label: "Usuarios" },
    { to: "/reporte-inventario", label: "Reporte Inventario" },
    { to: "/recibos", label: "Recibos" },
    { to: "/lista-recibos", label: "Lista Recibos" },
    { to: "/movimientos", label: "Movimientos" },
    { to: "/reporte-ventas", label: "Reporte Ventas" },
    { to: "/cartera", label: "Cartera" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md px-6 py-3 flex items-center gap-3">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`px-4 py-2 rounded-md transition-colors ${
            location.pathname === link.to
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          {link.label}
        </Link>
      ))}

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="ml-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-full shadow"
      >
        Cerrar sesión
      </button>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <Navbar />

      {/* Contenido principal */}
      <div className="p-6">
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
          <Route path="/cartera" element={<CarteraPage />} />
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

        {/* Redirección si abren la raíz */}
        <Route path="/" element={<Navigate to="/login" />} />
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
