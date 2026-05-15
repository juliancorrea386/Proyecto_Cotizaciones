// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
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
import PrecioPage from "./pages/PrecioPage";

// Rutas restringidas solo para admin
const ADMIN_ONLY_ROUTES = ["/reporte-inventario", "/usuarios"];

function RoleRoute({ adminOnly, children }) {
  const role = localStorage.getItem("role");
  if (adminOnly && role !== "admin") {
    return <Navigate to="/cotizaciones" replace />;
  }
  return children;
}

function Navbar() {
  const location = useLocation();
  const [openMenu, setOpenMenu] = React.useState(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const menuItems = [
    {
      key: "inventario",
      label: "Inventario",
      links: [
        { to: "/productos", label: "Productos" },
        { to: "/precio", label: "Actualizar Precio" },
        { to: "/movimientos", label: "Movimientos" },
        // Solo admin ve Reporte Inventario
        ...(isAdmin ? [{ to: "/reporte-inventario", label: "Reporte Inventario" }] : []),
      ],
    },
    {
      key: "ventas",
      label: "Ventas",
      links: [
        { to: "/cotizaciones", label: "Cotizaciones" },
        { to: "/lista-cotizaciones", label: "Lista Cotizaciones" },
        { to: "/recibos", label: "Recibos" },
        { to: "/lista-recibos", label: "Lista Recibos" },
        { to: "/reporte-ventas", label: "Reporte Ventas" },
      ],
    },
    {
      key: "admin",
      label: "Administración",
      links: [
        { to: "/clientes", label: "Clientes" },
        // Solo admin ve Usuarios
        ...(isAdmin ? [{ to: "/usuarios", label: "Usuarios" }] : []),
        { to: "/cartera", label: "Cartera" },
      ],
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      {/* Barra principal */}
      <div className="px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-blue-600">Mi Sistema</h1>

        {/* Menú desktop */}
        <div className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <div key={item.key} className="relative">
              <button
                onClick={() => toggleMenu(item.key)}
                className="font-medium hover:text-blue-600 text-sm"
              >
                {item.label} ▾
              </button>
              {openMenu === item.key && (
                <div className="absolute bg-white shadow-lg rounded mt-2 w-52 z-50">
                  {item.links.map((link) => (
                    <Link
                      key={link.to}
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      to={link.to}
                      onClick={closeAll}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              window.location.href = "/login";
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Botones móvil */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              window.location.href = "/login";
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs"
          >
            Salir
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Menú"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          {menuItems.map((item) => (
            <div key={item.key}>
              <button
                onClick={() => toggleMenu(item.key)}
                className="w-full flex justify-between items-center px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 text-sm"
              >
                {item.label}
                <span>{openMenu === item.key ? "▴" : "▾"}</span>
              </button>
              {openMenu === item.key && (
                <div className="bg-gray-50 pl-6 border-l-2 border-blue-200 ml-4 mr-4 mb-1 rounded">
                  {item.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeAll}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <Navbar />
      <div className="p-3 md:p-6">
        <Routes>
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route
            path="/usuarios"
            element={
              <RoleRoute adminOnly>
                <UsuariosPage />
              </RoleRoute>
            }
          />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/lista-cotizaciones" element={<ListaCotizaciones />} />
          <Route path="/editar-cotizacion/:id" element={<EditarCotizaciones />} />
          <Route
            path="/reporte-inventario"
            element={
              <RoleRoute adminOnly>
                <ReporteInvPage />
              </RoleRoute>
            }
          />
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
        <Route path="/login" element={<LoginPage />} />
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