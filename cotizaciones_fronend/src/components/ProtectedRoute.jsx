import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children }) => {
  const token = authService.getToken();
  const user = authService.getUser();

  // Si no hay token o usuario → redirige al login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children; // ✅ muestra la ruta si está logueado
};

export default ProtectedRoute;
