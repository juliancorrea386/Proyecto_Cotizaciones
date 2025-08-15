const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db"); // tu conexión a MySQL
const router = express.Router();

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// Login
// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const [[user]] = await db.query("SELECT * FROM usuarios WHERE username = ?", [username]);

  if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, }, JWT_SECRET, { expiresIn: "1d" });
  //console.log("🔐 Token generado:", token);
  //console.log("📦 Contenido del token:", jwt.decode(token));
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role // asegúrate de tener esta columna en tu tabla `users`
    }
  });
  //console.log(`Token ${token} Token`);
});


// Listar usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, password, role FROM usuarios ORDER BY username ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener Usuarios' });
  }
});

// Obtener Usuario por id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, password, role FROM usuarios WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el Usuario' });
  }
});

router.post("/", async (req, res) => {
  const { username, password, role = "user" } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
  }

  try {
    // Verificar si ya existe ese correo
    const [existingUser] = await db.query("SELECT * FROM usuarios WHERE username = ?", [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "El usuario ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    await db.query(
      "INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role]
    );

    return res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { username, password = null, role = null } = req.body;
    if (!username) return res.status(400).json({ message: 'nombre es requerido' });
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query('UPDATE usuarios SET username = ?, password = ?, role = ? WHERE id = ?', [username, hashedPassword, role, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ id: req.params.id, username, password, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar Usuario' });
  }
});


module.exports = router;
