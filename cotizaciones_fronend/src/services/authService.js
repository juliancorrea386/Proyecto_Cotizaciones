import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const authService = {
  login: async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      // Guardar token y usuario en localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return res.data.user;
    } catch (err) {
      console.error("Error en login:", err);
      throw new Error(err.response?.data?.message || "Usuario o contraseña incorrectos");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  getToken: () => {
    return localStorage.getItem("token");
  }
};

export default authService;
