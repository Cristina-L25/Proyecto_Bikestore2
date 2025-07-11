// ============================================
// Validación de formularios de autenticación
// ============================================

// Importamos la función mostrarMensaje existente en vez de redefinirla
import { mostrarMensaje, updateUIBasedOnAuth } from './ui.js';
import { sincronizarCarrito, sincronizarFavoritos } from './syncManager.js';

// Función para validar el formulario de registro
export function attachRegistroListener() {
  const url = 'http://localhost:3000/auth/register';
  const formUsuarios = document.getElementById('registerForm');
  const nombre = document.getElementById('nombre');
  const telefono = document.getElementById('telefono');
  const email = document.getElementById('email');
  const contraseña = document.getElementById('contraseña');
  const direccion = document.getElementById('direccion');
  
  // Verificar si el correo ya existe
  email.addEventListener('blur', async () => {
    if (email.value && isValidEmail(email.value)) {
      await verificarCorreoExistente(email.value);
    }
  });

  formUsuarios.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMensajesError();

    const confirmarContraseñaElement = document.getElementById('confirmarContraseña');

    const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,30}$/.test(nombre.value.trim());
    if (!nombreValido) {
      mostrarError(nombre, 'Solo letras, entre 3 y 30 caracteres');
      return;
    }

    function validarTelefono() {
      const codigo = document.getElementById("codigoPais").value;
      const numero = document.getElementById("telefono").value.trim().replace(/\D/g, '');

      if (numero.length < 6 || numero.length > 12) {
        mostrarError(telefono, "Número inválido");
        return false;
      }

      telefono.value = `${codigo}${numero}`;
      return true;
    }

    if (!isValidEmail(email.value)) {
      mostrarError(email, 'El formato del correo electrónico no es válido');
      return;
    }

    const correo = email.value.trim().toLowerCase();
    const dominiosPermitidos = [
      "@gmail.com",
      "@gmail.co",
      "@hotmail.com",
      "@hotmail.co",
      "@outlook.com",
      "@outlook.co"
    ];

    const esDominioValido = dominiosPermitidos.some(d => correo.endsWith(d));
    if (!esDominioValido) {
      mostrarError(email, "Solo correos @gmail, @hotmail o @outlook (.com/.co)");
      return;
    }

    const correoExiste = await verificarCorreoExistente(email.value.trim());
    if (correoExiste) return;

    const password = contraseña.value;
    const validPass =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
      !/\s/.test(password) &&
      password !== nombre.value.trim() &&
      password !== email.value.trim();

    if (!validPass) {
      mostrarError(contraseña, 'Debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo, sin espacios, no igual a nombre/email');
      return;
    }

    if (confirmarContraseñaElement && contraseña.value !== confirmarContraseñaElement.value) {
      mostrarError(confirmarContraseñaElement, 'Las contraseñas no coinciden');
      return;
    }

    if (direccion.value.trim().length < 5 || direccion.value.trim().length > 100) {
      mostrarError(direccion, 'Debe tener entre 5 y 100 caracteres');
      return;
    }

    const data = {
      nombre: nombre.value,
      telefono: telefono.value,
      email: email.value,
      contraseña: contraseña.value,
      direccion: direccion.value
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        mostrarMensaje('Registro exitoso. Ahora puedes iniciar sesión', 3000);
        document.getElementById("signup").style.display = "none";
        document.getElementById("signIn").style.display = "block";
        formUsuarios.reset();
      } else {
        mostrarMensaje(`Error: ${responseData.error}`, 3000);
      }
    } catch (error) {
      console.error('Error', error);
      mostrarMensaje('Error al registrar. Intenta nuevamente', 3000);
    }
  });
}

// Función para validar el formulario de login
export function attachLoginListener() {
  const loginIcon = document.getElementById("loginIcon");
  const loginModal = document.getElementById("loginModal");
  const sessionModal = document.getElementById("session-modal");

  if (!loginIcon || !loginModal || !sessionModal) {
    console.warn("No se encontró el loginIcon o los modales");
    return;
  }

  loginIcon.addEventListener("click", function () {
    const token = localStorage.getItem('token');
    const sessionModal = document.getElementById("session-modal");

    if (token && sessionModal) {
      sessionModal.classList.add("active");
      console.log("Mostrando modal de sesión");
      return;
    }

    if (!token) {
      loginModal.style.display = "flex";
    }
  });

  // Cierra el modal con el botón de cierre
  const closeButton = loginModal.querySelector(".close-button");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      loginModal.style.display = "none";
      console.log("Login modal cerrado con la X");
    });
  } else {
    console.warn("No se encontró el botón de cierre (.close-button) en login modal");
  }

  // Cierra el modal al hacer clic fuera del contenido
  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      loginModal.style.display = "none";
      console.log("Login modal cerrado al hacer clic fuera del contenido");
    }
  });

  // Configuración de cambio entre formularios de login y registro
  const signUpButton = loginModal.querySelector("#signUpButton");
  const signInButton = loginModal.querySelector("#signInButton");
  const signInContainer = loginModal.querySelector("#signIn");
  const signUpContainer = loginModal.querySelector("#signup");

  if (signUpButton && signInContainer && signUpContainer) {
    signUpButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Cambiando a Registro (Sign Up)");
      signInContainer.style.display = "none";
      signUpContainer.style.display = "block";
    });
  }
  
  if (signInButton && signInContainer && signUpContainer) {
    signInButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Cambiando a Acceder (Sign In)");
      signUpContainer.style.display = "none";
      signInContainer.style.display = "block";
    });
  }

  // Añadir submit event al formulario de login con validaciones
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      limpiarMensajesError();
      
      const email = document.getElementById("signInEmail");
      const password = document.getElementById("signInPassword");
      
      if (!validarCamposCompletos([email, password])) {
        mostrarMensaje('Todos los campos son obligatorios', 3000);
        return;
      }
      
      if (!isValidEmail(email.value)) {
        mostrarError(email, 'El formato del correo electrónico no es válido');
        return;
      }
      
      console.log("Formulario de login enviado con:", email.value);
      login(email.value, password.value);
    });
  } else {
    console.warn("No se encontró el formulario de login con id 'loginForm'");
  }
}

// Función para validar el formato de correo electrónico
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar que la contraseña cumpla con los requisitos
function validarContraseña(contraseña) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
  return passwordRegex.test(contraseña);
}

// Función para validar que todos los campos estén completos
function validarCamposCompletos(campos) {
  let camposCompletos = true;
  
  campos.forEach(campo => {
    if (!campo.value.trim()) {
      mostrarError(campo, 'Este campo es obligatorio');
      camposCompletos = false;
    }
  });
  
  return camposCompletos;
}

// Función para verificar si el correo ya existe en la base de datos
async function verificarCorreoExistente(email) {
  try {
    const response = await fetch('http://localhost:3000/auth/verificar-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (data.existe) {
      mostrarError(document.getElementById('email'), 'Este correo ya está en uso');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar el correo:', error);
    return false;
  }
}

// Función para mostrar mensaje de error en un campo específico
function mostrarError(campo, mensaje) {
  const errorExistente = campo.parentElement.querySelector('.error-message');
  if (errorExistente) {
    errorExistente.remove();
  }
  
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = mensaje;
  errorElement.style.color = 'red';
  errorElement.style.fontSize = '12px';
  errorElement.style.marginTop = '5px';
  
  campo.parentElement.appendChild(errorElement);
  campo.style.borderColor = 'red';
}

// Función para limpiar todos los mensajes de error
function limpiarMensajesError() {
  document.querySelectorAll('.error-message').forEach(error => error.remove());
  document.querySelectorAll('input').forEach(input => {
    input.style.borderColor = '';
  });
}

// Función para iniciar sesión (login)
export async function login(email, password) {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contraseña: password })
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);
    
    if (response.ok) {
      localStorage.setItem('token', data.token);

      const payload = parseJwt(data.token);
      console.log("Email en payload:", payload.sub);

      const role = payload.role || 'cliente';
      console.log("Rol extraído:", role);

      localStorage.setItem('userRole', role);
      localStorage.setItem('userId', payload.id);

      await sincronizarCarrito(payload.id);
      await sincronizarFavoritos(payload.id);

      mostrarMensaje('Inicio de sesión exitoso', 3000);

      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.style.display = 'none';
      }

      if (role === 'admin') {
        window.location.href = './templates/panel_admin/index.html';
      } else {
        updateUIBasedOnAuth();
      }
    } else {
      mostrarMensaje(`Error: ${data.error}`, 3000);
    }
  } catch (error) {
    console.error(error);
    mostrarMensaje('Error de conexión', 3000);
  }
}

// Función para decodificar el token JWT
function parseJwt(token) {
  try {
    console.log("Token completo:", token);

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token inválido');
      return {};
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    console.log("Payload decodificado detallado:", payload);

    return payload;
  } catch (e) {
    console.error('Error decodificando JWT', e);
    return {};
  }
}

export function attachLogoutListener() {
  const logoutIcon = document.getElementById("logoutButton");
  if (logoutIcon) {
    logoutIcon.addEventListener("click", () => {
      logout();
      mostrarMensaje('Sesión cerrada');
    });
    console.log("Listener de logout adjuntado");
  } else {
    console.warn("No se encontró el botón de logout");
  }
}

export function logout() {
  mostrarMensaje('Sesión cerrada correctamente');

  const sessionModal = document.getElementById('session-modal');
  if (sessionModal && sessionModal.classList.contains('active')) {
    sessionModal.classList.remove('active');
  }

  localStorage.removeItem('token');
  localStorage.removeItem('userRole');

  updateUIBasedOnAuth();

  window.location.href = `${window.location.origin}/frontend/index.html`;
}

// Función para adjuntar el listener de recuperación de contraseña
export function attachForgotPasswordListener() {
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const resetPasswordModal = document.getElementById('resetPasswordModal');
  
  if (forgotPasswordLink && forgotPasswordModal) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      const loginModal = document.getElementById('loginModal');
      if (loginModal) loginModal.style.display = 'none';
      
      forgotPasswordModal.style.display = 'flex';
    });
  }
  
  setupModalCloseBehavior(forgotPasswordModal);
  setupModalCloseBehavior(resetPasswordModal);
  
  // Configurar formulario de solicitud de recuperación
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotPasswordEmail').value.trim();
      const messageElement = document.getElementById('forgotPasswordMessage');
      
      if (!isValidEmail(email)) {
        messageElement.textContent = 'Por favor ingresa un email válido';
        messageElement.style.color = 'red';
        return;
      }
      
      try {
        const response = await fetch('http://localhost:3000/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          messageElement.textContent = data.message || 'Se ha enviado un enlace de recuperación a tu email';
          messageElement.style.color = 'green';
          forgotPasswordForm.reset();
        } else {
          messageElement.textContent = data.error || 'Error al procesar la solicitud';
          messageElement.style.color = 'red';
        }
      } catch (error) {
        console.error('Error:', error);
        messageElement.textContent = 'Error de conexión. Intenta nuevamente.';
        messageElement.style.color = 'red';
      }
    });
  }
  


  // Configurar formulario de restablecimiento de contraseña
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = document.getElementById('resetToken').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;
      const messageElement = document.getElementById('resetPasswordMessage');
      
      // Validaciones
      if (newPassword !== confirmNewPassword) {
        messageElement.textContent = 'Las contraseñas no coinciden';
        messageElement.style.color = 'red';
        return;
      }
      
      if (!validarContraseña(newPassword)) {
        messageElement.textContent = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos';
        messageElement.style.color = 'red';
        return;
      }
      
      try {
        const response = await fetch('http://localhost:3000/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          messageElement.textContent = data.message || 'Contraseña actualizada exitosamente';
          messageElement.style.color = 'green';
          
          // Cerrar el modal después de 2 segundos
          setTimeout(() => {
            resetPasswordModal.style.display = 'none';
            // Mostrar modal de login
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'flex';
          }, 2000);
        } else {
          messageElement.textContent = data.error || 'Error al restablecer la contraseña';
          messageElement.style.color = 'red';
        }
      } catch (error) {
        console.error('Error:', error);
        messageElement.textContent = 'Error de conexión. Intenta nuevamente.';
        messageElement.style.color = 'red';
      }
    });
  }
  
  // Verificar si hay un token en la URL (cuando el usuario hace clic en el enlace del email)
  checkForResetTokenInURL();
}

// Función para verificar si hay un token de recuperación en la URL
export function checkForResetTokenInURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Guardar el token en el formulario
    document.getElementById('resetToken').value = token;
    
    // Mostrar modal de restablecimiento
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    if (resetPasswordModal) {
      resetPasswordModal.style.display = 'flex';
      
      // Ocultar otros modales si están abiertos
      const loginModal = document.getElementById('loginModal');
      const forgotPasswordModal = document.getElementById('forgotPasswordModal');
      if (loginModal) loginModal.style.display = 'none';
      if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';
    }
    
    // Limpiar el token de la URL sin recargar la página
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Función para verificar el token de recuperación
async function verifyResetToken(token) {
  try {
    const response = await fetch(`http://localhost:3000/auth/verify-reset-token?token=${token}`);
    const data = await response.json();
    
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    
    if (response.ok && data.valid) {
      // Guardar el token en el formulario
      document.getElementById('resetToken').value = token;
      
      // Mostrar modal de restablecimiento
      if (resetPasswordModal) {
        resetPasswordModal.style.display = 'flex';
      }
      
      // Limpiar el token de la URL sin recargar la página
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Mostrar mensaje de error en el modal de recuperación
      if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'flex';
        const messageElement = document.getElementById('forgotPasswordMessage');
        messageElement.textContent = 'El enlace de recuperación es inválido o ha expirado';
        messageElement.style.color = 'red';
      }
    }
  } catch (error) {
    console.error('Error al verificar el token:', error);
  }
}

// Función auxiliar para configurar el cierre de modales
function setupModalCloseBehavior(modal) {
  if (!modal) return;
  
  // Cerrar con el botón X
  const closeButton = modal.querySelector('.close-button');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  
  // Cerrar al hacer clic fuera del contenido
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}


