const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer token"

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido o expirado" });
    }
    req.user = decoded; // 👈 aquí tienes { id, email, role }
    next();
  });
}

module.exports = verifyToken;
