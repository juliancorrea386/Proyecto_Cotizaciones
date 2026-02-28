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
import PrecioPage from "./pages/PrecioPage"
import { Navigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const [openMenu, setOpenMenu] = React.useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md px-6 py-3 flex items-center gap-6">

      {/* LOGO */}
      <h1 className="text-lg font-bold text-blue-600">Mi Sistema</h1>

      {/* INVENTARIO */}
      <div className="relative">
        <button
          onClick={() => toggleMenu("inventario")}
          className="font-medium hover:text-blue-600"
        >
          Inventario ▾
        </button>

        {openMenu === "inventario" && (
          <div className="absolute bg-white shadow-lg rounded mt-2 w-52">
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/productos">Productos</Link>
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/precio">Actualizar Precio</Link>
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/movimientos">Movimientos</Link>
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/reporte-inventario">Reporte Inventario</Link>
          </div>
        )}
      </div>

      {/* VENTAS */}
      <div className="relative">
        <button
          onClick={() => toggleMenu("ventas")}
          className="font-medium hover:text-blue-600"
        >
          Ventas ▾
        </button>

        {openMenu === "ventas" && (
          <div className="absolute bg-white shadow-lg rounded mt-2 w-56">
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/cotizaciones">Cotizaciones</Link>
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/lista-cotizaciones">Lista Cotizaciones</Link>
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/recibos">Recibos</Link>
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/lista-recibos">Lista Recibos</Link>
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/reporte-ventas">Reporte Ventas</Link>
          </div>
        )}
      </div>

      {/* ADMIN */}
      <div className="relative">
        <button
          onClick={() => toggleMenu("admin")}
          className="font-medium hover:text-blue-600"
        >
          Administración ▾
        </button>

        {openMenu === "admin" && (
          <div className="absolute bg-white shadow-lg rounded mt-2 w-48">
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/clientes">Clientes</Link>
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/usuarios">Usuarios</Link>
            <Link className="block px-4 py-2 hover:bg-gray-100" to="/cartera">Cartera</Link>
          </div>
        )}
      </div>

      {/* BOTÓN CERRAR SESIÓN */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="ml-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
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
          <Route path="/precio" element={<PrecioPage />} />
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
