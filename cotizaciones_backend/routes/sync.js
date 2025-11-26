// routes/sync.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Crear pool de conexiones usando las variables de entorno
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ==================== SINCRONIZAR COTIZACIONES ====================
router.post('/cotizaciones', async (req, res) => {
  const { cotizaciones } = req.body;
  
  if (!cotizaciones || !Array.isArray(cotizaciones)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  console.log(`📥 Recibidas ${cotizaciones.length} cotizaciones para sincronizar`);

  const detalles = [];
  let exitosas = 0;
  let fallidas = 0;

  // Procesar cada cotización
  for (const cot of cotizaciones) {
    let connection;
    
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      console.log(`📝 Procesando:`, {
        id_local: cot.id_local,
        id_servidor: cot.id_servidor,
        numero: cot.numero_cotizacion,
        tipo: cot.id_servidor ? 'EDICIÓN' : 'NUEVA'
      });

      // CASO 1: Cotización editada (tiene id_servidor)
      if (cot.id_servidor) {
        console.log(`✏️ Actualizando cotización ID: ${cot.id_servidor}`);
        
        // Verificar que existe
        const [existe] = await connection.query(
          'SELECT id FROM cotizaciones WHERE id = ?',
          [cot.id_servidor]
        );

        if (!existe || existe.length === 0) {
          throw new Error('La cotización no existe en el servidor');
        }

        // Actualizar cotización principal
        await connection.query(
          `UPDATE cotizaciones 
           SET cliente_id = ?,
               tipo = ?,
               subtotal = ?,
               total = ?,
               saldo = ?,
               observaciones = ?
           WHERE id = ?`,
          [
            cot.cliente_id,
            cot.tipo,
            cot.subtotal || cot.total,
            cot.total,
            cot.tipo === 'credito' ? cot.total : 0,
            cot.observaciones || '',
            cot.id_servidor
          ]
        );

        // Eliminar detalles anteriores
        await connection.query(
          'DELETE FROM cotizacion_detalles WHERE cotizacion_id = ?',
          [cot.id_servidor]
        );

        // Insertar nuevos detalles
        for (const prod of cot.productos) {
          await connection.query(
            `INSERT INTO cotizacion_detalles 
             (cotizacion_id, producto_id, cantidad, precio_venta, subtotal) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              cot.id_servidor,
              prod.producto_id,
              prod.cantidad,
              prod.precio_venta,
              prod.cantidad * prod.precio_venta
            ]
          );
        }

        await connection.commit();
        console.log(`✅ Cotización ${cot.id_servidor} actualizada exitosamente`);

        detalles.push({
          id_local: cot.id_local,
          id_servidor: cot.id_servidor,
          numero_cotizacion: cot.numero_cotizacion,
          exito: true
        });
        exitosas++;

      } else {
        // CASO 2: Cotización nueva
        console.log(`➕ Creando nueva cotización: ${cot.numero_cotizacion}`);

        // Verificar si ya existe el número
        const [existente] = await connection.query(
          'SELECT id FROM cotizaciones WHERE numero_cotizacion = ?',
          [cot.numero_cotizacion]
        );

        if (existente && existente.length > 0) {
          throw new Error('El número de cotización ya existe en el servidor');
        }

        // Crear nueva cotización
        const [result] = await connection.query(
          `INSERT INTO cotizaciones 
           (numero_cotizacion, fecha, cliente_id, tipo, subtotal, total, saldo, observaciones) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cot.numero_cotizacion,
            cot.fecha,
            cot.cliente_id,
            cot.tipo,
            cot.subtotal || cot.total,
            cot.total,
            cot.tipo === 'credito' ? cot.total : 0,
            cot.observaciones || ''
          ]
        );

        const cotizacionId = result.insertId;

        // Insertar detalles
        for (const prod of cot.productos) {
          await connection.query(
            `INSERT INTO cotizacion_detalles 
             (cotizacion_id, producto_id, cantidad, precio_venta, subtotal) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              cotizacionId,
              prod.producto_id,
              prod.cantidad,
              prod.precio_venta,
              prod.cantidad * prod.precio_venta
            ]
          );
        }

        await connection.commit();
        console.log(`✅ Nueva cotización creada con ID: ${cotizacionId}`);

        detalles.push({
          id_local: cot.id_local,
          id_servidor: cotizacionId,
          numero_cotizacion: cot.numero_cotizacion,
          exito: true
        });
        exitosas++;
      }

    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      
      console.error(`❌ Error en cotización ${cot.numero_cotizacion}:`, error.message);
      
      detalles.push({
        id_local: cot.id_local,
        id_servidor: cot.id_servidor || null,
        numero_cotizacion: cot.numero_cotizacion,
        exito: false,
        error: error.message
      });
      fallidas++;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  console.log(`📊 Resultado: ${exitosas} exitosas, ${fallidas} fallidas`);

  res.json({
    mensaje: 'Sincronización completada',
    total: cotizaciones.length,
    exitosas,
    fallidas,
    detalles
  });
});

// ==================== DESCARGAR DATOS INICIALES ====================
router.get('/datos-iniciales', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();

    console.log('📥 Descargando datos iniciales...');

    // Productos - SIN filtro 'activo'
    const [productos] = await connection.query(
      'SELECT id, nombre, precio_venta, Referencia, stock FROM productos ORDER BY nombre'
    );

    // Clientes - SIN filtro 'activo'
    const [clientes] = await connection.query(
      `SELECT c.id, c.nombre, c.telefono, m.nombre AS municipio, c.municipio_id
       FROM clientes c
       LEFT JOIN municipios m ON c.municipio_id = m.id
       ORDER BY c.nombre`
    );

    // Municipios
    const [municipios] = await connection.query(
      'SELECT id, nombre FROM municipios ORDER BY nombre'
    );

    console.log(`✅ Datos obtenidos: ${productos.length} productos, ${clientes.length} clientes, ${municipios.length} municipios`);

    res.json({
      productos: productos || [],
      clientes: clientes || [],
      municipios: municipios || []
    });
  } catch (error) {
    console.error('❌ Error obteniendo datos iniciales:', error);
    res.status(500).json({ error: 'Error al obtener datos: ' + error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// ==================== DESCARGAR COTIZACIONES DEL SERVIDOR ====================
router.get('/cotizaciones', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();

    // Obtener parámetros opcionales de filtro
    const { desde, hasta, usuario_id } = req.query;

    console.log('📥 Descargando cotizaciones del servidor...', { desde, hasta, usuario_id });

    // Construir query base
    let query = `
      SELECT 
        c.id as id_servidor,
        c.numero_cotizacion,
        c.fecha,
        c.cliente_id,
        cli.nombre as cliente_nombre,
        cli.telefono as cliente_telefono,
        m.nombre as cliente_municipio,
        c.tipo,
        c.subtotal,
        c.total,
        c.saldo,
        c.observaciones,
        c.created_at,
        c.updated_at
      FROM cotizaciones c
      LEFT JOIN clientes cli ON c.cliente_id = cli.id
      LEFT JOIN municipios m ON cli.municipio_id = m.id
      WHERE 1=1
    `;

    const params = [];

    // Filtro por rango de fechas (opcional)
    if (desde) {
      query += ' AND c.fecha >= ?';
      params.push(desde);
    }

    if (hasta) {
      query += ' AND c.fecha <= ?';
      params.push(hasta);
    }

    // Filtro por usuario (opcional - si quieres filtrar por vendedor)
    if (usuario_id) {
      query += ' AND c.usuario_id = ?';
      params.push(usuario_id);
    }

    query += ' ORDER BY c.fecha DESC, c.id DESC';

    // Ejecutar query principal
    const [cotizaciones] = await connection.query(query, params);

    console.log(`✅ ${cotizaciones.length} cotizaciones encontradas en servidor`);

    // Obtener productos de cada cotización
    for (const cot of cotizaciones) {
      const [productos] = await connection.query(
        `SELECT 
          cd.producto_id,
          p.nombre as producto_nombre,
          p.Referencia as producto_referencia,
          cd.cantidad,
          cd.precio_venta,
          cd.subtotal
        FROM cotizacion_detalles cd
        LEFT JOIN productos p ON cd.producto_id = p.id
        WHERE cd.cotizacion_id = ?`,
        [cot.id_servidor]
      );

      cot.productos = productos || [];
    }

    res.json({
      total: cotizaciones.length,
      cotizaciones: cotizaciones
    });

  } catch (error) {
    console.error('❌ Error descargando cotizaciones:', error);
    res.status(500).json({ 
      error: 'Error al descargar cotizaciones: ' + error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// ==================== ENDPOINT DE PRUEBA/SALUD ====================
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor de sincronización funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;