// auth.js - Backend
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Importamos la conexión a la base de datos
const conexion = require('../db/connection');

// Clave secreta para firmar el token (en producción, guarda esta clave en una variable de entorno)
const SECRET_KEY = 'xAE4&g9!pQw7*zRt';  // Cambia esto por una cadena segura

// Configuración del transporter para nodemailer (ejemplo para Gmail)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER || 'crislopez.bam@gmail.com',
    pass: process.env.EMAIL_PASS || 'w s a l t m b f h x a f h k h h'
  }
});

// Ruta de registro
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, contraseña, telefono, direccion, role } = req.body;

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Consulta SQL para insertar el nuevo usuario
    const query = `
      INSERT INTO Usuarios (nombre, email, contraseña, telefono, direccion, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Ejecutar la consulta
    conexion.query(
      query,
      [nombre, email, hashedPassword, telefono, direccion, role || 'cliente'],
      (err, resultado) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error al registrar usuario' });
        }
        res.json({ message: 'Usuario registrado exitosamente' });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta de login
router.post('/login', (req, res) => {
  const { email, contraseña } = req.body;
  const query = 'SELECT * FROM Usuarios WHERE email = ?';

  conexion.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });
    if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const user = results[0];
    console.log("Usuario desde la base de datos:", user);
    console.log("Role del usuario:", user.role);

    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        sub: user.email
      },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    console.log("Token generado:", token);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  });
});

// Ruta para verificar si un correo ya existe
router.post('/verificar-email', (req, res) => {
  const { email } = req.body;
  const query = 'SELECT * FROM Usuarios WHERE email = ?';

  conexion.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al verificar el correo:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    // Si hay resultados, el correo ya existe
    const existe = results.length > 0;
    
    res.json({ existe });
  });
});

// Ruta para solicitar recuperación de contraseña
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  
  // 1. Verificar que el email existe
  const query = 'SELECT * FROM Usuarios WHERE email = ?';
  conexion.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Email no registrado' });
    }
    
    const user = results[0];
    
    // 2. Generar token y fecha de expiración (1 hora)
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora
    
    // 3. Actualizar usuario con el token
    const updateQuery = `
      UPDATE Usuarios 
      SET reset_password_token = ?, reset_password_expires = ?
      WHERE id = ?
    `;
    
    conexion.query(updateQuery, [token, expires, user.id], (err) => {
      if (err) {
        console.error('Error al actualizar usuario:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      
      //  Enviar email con enlace al frontend
      // Cambiamos la URL para que apunte al frontend con el token como parámetro
const resetUrl = `http://localhost:3000/frontend/index.html?token=${token}`;
      
      const mailOptions = {
        to: user.email,
        subject: 'Recuperación de Contraseña - Tu Tienda',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666; font-size: 16px;">Hola,</p>
              <p style="color: #666; font-size: 16px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p style="color: #666; font-size: 16px;">Haz clic en el siguiente botón para continuar:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
                  Restablecer Contraseña
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
              <p style="color: #007bff; font-size: 14px; word-break: break-all;">${resetUrl}</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <p style="color: #999; font-size: 12px;">Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
              <p style="color: #999; font-size: 12px;">Este enlace expirará en 1 hora por seguridad.</p>
            </div>
          </div>
        `
      };
      
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error('Error al enviar email:', error);
          return res.status(500).json({ error: 'Error al enviar email de recuperación' });
        }
        
        res.json({ message: 'Se ha enviado un enlace de recuperación a tu email' });
      });
    });
  });
});

// Ruta para verificar token de recuperación
router.get('/verify-reset-token', (req, res) => {
  const { token } = req.query;
  
  const query = `
    SELECT * FROM Usuarios 
    WHERE reset_password_token = ? 
    AND reset_password_expires > NOW()
  `;
  
  conexion.query(query, [token], (err, results) => {
    if (err) {
      console.error('Error al verificar token:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado', valid: false });
    }
    
    res.json({ valid: true, email: results[0].email });
  });
});

// Ruta para restablecer la contraseña
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  // 1. Verificar token válido
  const verifyQuery = `
    SELECT * FROM Usuarios 
    WHERE reset_password_token = ? 
    AND reset_password_expires > NOW()
  `;
  
  conexion.query(verifyQuery, [token], async (err, results) => {
    if (err) {
      console.error('Error al verificar token:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    
    const user = results[0];
    
    // 2. Validar nueva contraseña
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }
    
    // 3. Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 4. Actualizar contraseña y limpiar token
    const updateQuery = `
      UPDATE Usuarios 
      SET contraseña = ?, reset_password_token = NULL, reset_password_expires = NULL
      WHERE id = ?
    `;
    
    conexion.query(updateQuery, [hashedPassword, user.id], (err) => {
      if (err) {
        console.error('Error al actualizar contraseña:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      
      res.json({ message: 'Contraseña actualizada exitosamente' });
    });
  });
});

module.exports = router;