// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Middlewares
const verifyToken = require('./middlewares/verifyToken');
const isAdmin = require('./middlewares/isAdmin');

// Importamos la conexión a la base de datos
const conexion = require('../db/connection');



router.get(
  '/usuarios/:id/pedidos',
  verifyToken,
  isAdmin,
  async (req, res) => {
    const usuarioId = req.params.id;
    try {
      const conn = conexion.promise();
      // Cambia 'COUNT(*) AS total' si quieres devolver la lista, aquí devolvemos solo el conteo:
      const [rows] = await conn.query(
        'SELECT COUNT(*) AS pedidosCount FROM pedidos WHERE usuario_id = ?',
        [usuarioId]
      );
      res.json({ pedidosCount: rows[0].pedidosCount });
    } catch (err) {
      console.error('Error al verificar pedidos del usuario:', err);
      res.status(500).json({ error: 'Error al verificar pedidos' });
    }
  }
);


// Ruta para eliminar usuario (y opcionalmente sus pedidos)
router.delete('/usuarios/:id', verifyToken, isAdmin, async (req, res) => {
  const usuarioId = req.params.id;
  const eliminarPedidos = req.query.eliminar_pedidos === 'true';

  try {
    const conn = conexion.promise();
    await conn.beginTransaction();

    if (eliminarPedidos) {
      // 1. Obtener todos los pedidos de ese usuario
      const [pedidos] = await conn.query(
        'SELECT id FROM pedidos WHERE usuario_id = ?',
        [usuarioId]
      );

      for (const pedido of pedidos) {
        // 2. Eliminar detalles del pedido
        await conn.query(
          'DELETE FROM detalle_pedidos WHERE pedido_id = ?',
          [pedido.id]
        );

        // 3. Eliminar venta asociada (si la hay)
        await conn.query(
          'DELETE FROM ventas WHERE pedido_id = ?',
          [pedido.id]
        );

        // 4. Eliminar el pedido
        await conn.query(
          'DELETE FROM pedidos WHERE id = ?',
          [pedido.id]
        );
      }
    } else {
      // Verificar si hay pedidos sin eliminarlos
      const [rows] = await conn.query(
        'SELECT COUNT(*) AS total FROM pedidos WHERE usuario_id = ?',
        [usuarioId]
      );
      if (rows[0].total > 0) {
        // Enviar conflicto para que el frontend pregunte si quiere borrar pedidos
        return res.status(409).json({
          error: 'CONFLICT_PEDIDOS',
          message: 'El usuario tiene pedidos asociados'
        });
      }
    }

    // 5. Eliminar el usuario
    await conn.query(
      'DELETE FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    await conn.commit();
    res.json({ message: 'Usuario eliminado correctamente' });

  } catch (error) {
    // Revertir si algo falla
    await conexion.promise().rollback();
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});




// Obtener todos los usuarios (solo para administradores)
router.get('/usuarios', verifyToken, isAdmin, (req, res) => {
    const query = 'SELECT id, nombre, email, telefono, direccion, role, fecha_registro FROM Usuarios';
    
    conexion.query(query, (error, resultados) => {
        if (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(resultados);
    });
});

// Obtener un usuario específico (solo para administradores)
router.get('/usuarios/:id', verifyToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const query = 'SELECT id, nombre, email, telefono, direccion, role FROM Usuarios WHERE id = ?';
    
    conexion.query(query, [id], (error, resultados) => {
        if (error) {
            console.error('Error al obtener usuario:', error);
            return res.status(500).json({ error: 'Error al obtener usuario' });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(resultados[0]);
    });
});

// Crear un nuevo usuario (solo para administradores)
router.post('/usuarios', verifyToken, isAdmin, async (req, res) => {
    try {
        const { nombre, email, contraseña, telefono, direccion, role } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !email || !contraseña) { // <-- ¡Aquí se usa "contraseña"!
            return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
        }
        
        // Verificar si el email ya existe
        conexion.query('SELECT id FROM Usuarios WHERE email = ?', [email], async (error, resultados) => {
            if (error) {
                console.error('Error al verificar email:', error);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            if (resultados.length > 0) {
                return res.status(400).json({ error: 'Este email ya está registrado' });
            }
            
            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            
            // Insertar nuevo usuario
            const query = `
                INSERT INTO Usuarios (nombre, email, contraseña, telefono, direccion, role)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            conexion.query(
                query,
                [nombre, email, hashedPassword, telefono || null, direccion || null, role || 'cliente'],
                (error, resultado) => {
                    if (error) {
                        console.error('Error al crear usuario:', error);
                        return res.status(500).json({ error: 'Error al crear usuario' });
                    }
                    
                    res.status(201).json({
                        id: resultado.insertId,
                        nombre,
                        email,
                        telefono,
                        direccion,
                        role: role || 'cliente'
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar un usuario (solo para administradores)
router.put('/usuarios/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, direccion, role } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    
    // Verificar si el usuario existe
    conexion.query('SELECT id FROM Usuarios WHERE id = ?', [id], (error, resultados) => {
        if (error) {
            console.error('Error al verificar usuario:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Verificar si el email ya está en uso por otro usuario
        conexion.query('SELECT id FROM Usuarios WHERE email = ? AND id != ?', [email, id], (error, resultados) => {
            if (error) {
                console.error('Error al verificar email:', error);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            if (resultados.length > 0) {
                return res.status(400).json({ error: 'Este email ya está en uso por otro usuario' });
            }
            
            // Actualizar usuario
            const query = `
                UPDATE Usuarios
                SET nombre = ?, email = ?, telefono = ?, direccion = ?, role = ?
                WHERE id = ?
            `;
            
            conexion.query(
                query,
                [nombre, email, telefono || null, direccion || null, role || 'cliente', id],
                (error) => {
                    if (error) {
                        console.error('Error al actualizar usuario:', error);
                        return res.status(500).json({ error: 'Error al actualizar usuario' });
                    }
                    
                    res.json({
                        id,
                        nombre,
                        email,
                        telefono,
                        direccion,
                        role: role || 'cliente'
                    });
                }
            );
        });
    });
});






module.exports = router;