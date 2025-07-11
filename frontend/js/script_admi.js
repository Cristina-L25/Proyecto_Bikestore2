/* ===================== ADMINISTRACIÓN ===================== */
/* Funcionalidades para la sección de administración:
   - Gestión de usuarios (listar, crear, editar, eliminar)
   - Gestión de productos (listar, crear, editar)
   - Manejo de autenticación, navegación y notificaciones
*/
document.addEventListener('DOMContentLoaded', function () {
    // Configuración de modo de prueba

    
    // Elementos del DOM para navegación
    const menuBtns = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.section');

    // Elementos para usuarios
    const usuariosTable = document.getElementById('usuarios-tbody');
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');

    const modalUsuario = document.getElementById('modal-usuario'); // Cambiado de modalCliente a modalUsuario
    const formUsuario = document.getElementById('formulario-usuario'); // Cambiado de formCliente a formUsuario
    const cerrarModalUsuario = modalUsuario ? modalUsuario.querySelector('.cerrar-modal') : null; // Validación añadida
    const tituloModalUsuario = document.getElementById('titulo-modal-usuario'); // Cambiado de tituloModalCliente a tituloModalUsuario
    const cancelarUsuario = document.getElementById('cancelar-usuario'); // Cambiado de cancelarCliente a cancelarUsuario

    // Elementos para productos
    const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    const modalProducto = document.getElementById('modal-producto');
    const formProducto = document.getElementById('formulario-producto');
    const cerrarModalProducto = modalProducto ? modalProducto.querySelector('.cerrar-modal') : null; // Validación añadida
    const tituloModalProducto = document.getElementById('titulo-modal-producto'); // Corregido de tituloCModalProducto a tituloModalProducto
    const cancelarProducto = document.getElementById('cancelar-producto');

    // Modal de detalles de producto
    const modalDetalleProducto = document.getElementById('modal-detalle-producto');
    const detalleProductoContenido = document.getElementById('detalle-producto-contenido');

    // Elementos de notificación
    const notificacion = document.getElementById('notificacion');

    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');






    // 1. Referencias DOM
    const btnEmitir = document.getElementById('btn-emitir-reporte');
    const reporteCont = document.getElementById('reporte-container');
    const reporteTablaBody = document.querySelector('#reporte-tabla tbody');
    const reporteFecha = document.getElementById('reporte-fecha');
    const reporteUsuario = document.getElementById('reporte-usuario');




    // Referencia al botón de descarga
    const btnDescargar = document.getElementById('btn-descargar-reporte');




    // Botón de descarga PDF
    const btnDescargarPdf = document.getElementById('btn-descargar-pdf');



    const modoPrueba = false;
    const API_BASE = 'http://localhost:3000';













    // Función para mostrar alerta de stock bajo
// Función mejorada para mostrar alerta de stock bajo
async function mostrarAlertaStockBajo() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/productos/stock-bajo`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Error al obtener productos con stock bajo');
    
    const productosBajoStock = await response.json();
    
    // Eliminar alerta anterior si existe
    const alertaAnterior = document.getElementById('alerta-stock-bajo');
    if (alertaAnterior) alertaAnterior.remove();
    
    // Si hay productos con stock bajo
    if (productosBajoStock.length > 0) {
      const alerta = document.createElement('div');
      alerta.id = 'alerta-stock-bajo';
      alerta.className = 'alerta-stock';
      
      // Estilos críticos para evitar conflictos
      alerta.style.cssText = `
        position: fixed !important;
        top: 70px !important;
        right: 20px !important;
        width: 350px !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        z-index: 9999 !important;
        background: white !important;
        border: 2px solid #ff6b6b !important;
        border-radius: 8px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        font-family: inherit !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        pointer-events: auto !important;
        transform: translateZ(0) !important;
      `;
      
      alerta.innerHTML = `
        <div class="alerta-contenido" style="
          background: linear-gradient(135deg, #ff6b6b, #ff8e8e) !important;
          color: white !important;
          padding: 15px !important;
          border-radius: 6px 6px 0 0 !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          position: relative !important;
          z-index: 10000 !important;
        ">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 20px; color: white;"></i>
            <span style="font-weight: bold; font-size: 16px;">¡ATENCIÓN! Stock bajo (${productosBajoStock.length})</span>
          </div>
          <button class="btn-cerrar-alerta" style="
            background: none !important;
            border: none !important;
            color: white !important;
            font-size: 18px !important;
            cursor: pointer !important;
            padding: 5px !important;
            border-radius: 3px !important;
            transition: background-color 0.3s !important;
            z-index: 10001 !important;
          ">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="alerta-detalle" style="
          padding: 0 !important;
          max-height: 60vh !important;
          overflow-y: auto !important;
          background: white !important;
          border-radius: 0 0 6px 6px !important;
          position: relative !important;
          z-index: 9999 !important;
        ">
          <ul style="
            list-style: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          ">
            ${productosBajoStock.map(p => `
              <li class="producto-stock-bajo" style="
                display: flex !important;
                align-items: center !important;
                padding: 12px !important;
                border-bottom: 1px solid #f0f0f0 !important;
                gap: 12px !important;
                background: white !important;
                transition: background-color 0.3s !important;
                position: relative !important;
                z-index: 9999 !important;
              " onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor='white'">
                <div class="imagen-producto-alerta" style="
                  width: 50px !important;
                  height: 50px !important;
                  border-radius: 6px !important;
                  overflow: hidden !important;
                  flex-shrink: 0 !important;
                  border: 2px solid #ff6b6b !important;
                  position: relative !important;
                  z-index: 9999 !important;
                ">
                  <img src="${API_BASE}/uploads/productos/${p.imagen || 'default.jpg'}" 
                       alt="${p.nombre}" 
                       style="
                         width: 100% !important;
                         height: 100% !important;
                         object-fit: cover !important;
                         display: block !important;
                         position: relative !important;
                         z-index: 9999 !important;
                       "
                       onerror="this.src='${API_BASE}/uploads/productos/default.jpg'">
                </div>
                <div class="info-producto-alerta" style="
                  flex: 1 !important;
                  min-width: 0 !important;
                  position: relative !important;
                  z-index: 9999 !important;
                ">
                  <div class="nombre-producto" style="
                    font-weight: bold !important;
                    font-size: 14px !important;
                    color: #333 !important;
                    margin-bottom: 4px !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    white-space: nowrap !important;
                  ">${p.nombre}</div>
                  <div style="
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    gap: 8px !important;
                  ">
                    <span class="categoria-producto" style="
                      font-size: 12px !important;
                      color: #666 !important;
                      padding: 2px 6px !important;
                      background: #f0f0f0 !important;
                      border-radius: 3px !important;
                    ">${p.categoria}</span>
                    <span class="stock-producto" style="
                      font-size: 12px !important;
                      color: #ff6b6b !important;
                      font-weight: bold !important;
                      padding: 2px 6px !important;
                      background: #ffe6e6 !important;
                      border-radius: 3px !important;
                    ">Stock: ${p.stock}</span>
                  </div>
                </div>
                <button class="btn-editar" data-id="${p.id}" style="
                  background: #007bff !important;
                  color: white !important;
                  border: none !important;
                  padding: 8px 10px !important;
                  border-radius: 4px !important;
                  cursor: pointer !important;
                  font-size: 12px !important;
                  transition: all 0.3s !important;
                  flex-shrink: 0 !important;
                  position: relative !important;
                  z-index: 10000 !important;
                " onmouseover="this.style.backgroundColor='#0056b3'" onmouseout="this.style.backgroundColor='#007bff'">
                  <i class="fas fa-edit"></i>
                </button>
              </li>
            `).join('')}
          </ul>
        </div>
      `;

      // Crear overlay para evitar interacciones con el fondo
      const overlay = document.createElement('div');
      overlay.id = 'alerta-overlay';
      overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 9998 !important;
        pointer-events: none !important;
        backdrop-filter: blur(1px) !important;
        -webkit-backdrop-filter: blur(1px) !important;
      `;

      // Insertar en el body
      document.body.appendChild(overlay);
      document.body.appendChild(alerta);

      // Configurar eventos con prevención de propagación
      const btnCerrar = alerta.querySelector('.btn-cerrar-alerta');
      btnCerrar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        alerta.remove();
        overlay.remove();
      });

      // Hover effect para el botón cerrar
      btnCerrar.addEventListener('mouseover', function() {
        this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      });
      
      btnCerrar.addEventListener('mouseout', function() {
        this.style.backgroundColor = 'transparent';
      });

      // Configurar botones de edición con prevención de propagación
      alerta.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const productId = btn.getAttribute('data-id');
          abrirModalEdicionProducto(productId);
          // Cerrar alerta después de abrir modal
          alerta.remove();
          overlay.remove();
        });
      });

      // Prevenir que clics dentro de la alerta la cierren
      alerta.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Opcional: cerrar con ESC
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          alerta.remove();
          overlay.remove();
          document.removeEventListener('keydown', handleEsc);
        }
      };
      document.addEventListener('keydown', handleEsc);

      // Auto-ocultar después de 30 segundos (opcional)
      setTimeout(() => {
        if (document.body.contains(alerta)) {
          alerta.remove();
          overlay.remove();
        }
      }, 30000);
    }
  } catch (error) {
    console.error('Error al mostrar alerta de stock:', error);
  }
}

// Función mejorada para marcar productos con stock bajo en la lista
function marcarProductosStockBajo() {
  document.querySelectorAll('.producto').forEach(producto => {
    const stockElement = producto.querySelector('.stock');
    if (stockElement) {
      const stockText = stockElement.textContent;
      const stockValue = parseInt(stockText.replace(/\D/g, ''));
      if (stockValue < 5) {
        producto.classList.add('stock-bajo');
        stockElement.innerHTML = `Stock: <span class="stock-critico" style="color: #ff6b6b; font-weight: bold;">${stockValue}</span>`;
        
        // Agregar badge de advertencia con mejor posicionamiento
        const imagenContainer = producto.querySelector('.producto-imagen');
        if (imagenContainer && !imagenContainer.querySelector('.badge-stock')) {
          const badge = document.createElement('span');
          badge.className = 'badge-stock';
          badge.style.cssText = `
            position: absolute !important;
            top: 5px !important;
            left: 5px !important;
            background: #ff6b6b !important;
            color: white !important;
            padding: 2px 6px !important;
            border-radius: 3px !important;
            font-size: 12px !important;
            // font-weight: bold !important;
            z-index: 10 !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
          `;
          badge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Bajo stock';
          
          // Asegurar que el contenedor tenga position relative
          if (getComputedStyle(imagenContainer).position === 'static') {
            imagenContainer.style.position = 'relative';
          }
          
          imagenContainer.appendChild(badge);
        }
      }
    }
  });
}

// Función auxiliar para limpiar alertas existentes
function limpiarAlertasStock() {
  const alertaAnterior = document.getElementById('alerta-stock-bajo');
  const overlayAnterior = document.getElementById('alerta-overlay');
  
  if (alertaAnterior) alertaAnterior.remove();
  if (overlayAnterior) overlayAnterior.remove();
}

// Llamar a la función de limpieza antes de mostrar nueva alerta
function mostrarAlertaStockBajoSegura() {
  limpiarAlertasStock();
  mostrarAlertaStockBajo();
}




















    // Función para mostrar notificaciones (asegúrate de que está definida)
  function mostrarNotificacion(mensaje, tipo, duracion = 3000) {
  if (!notificacion) return;

  notificacion.textContent = mensaje;
  notificacion.className = `notificacion ${tipo}`;
  notificacion.style.display = 'block';

  setTimeout(() => {
    notificacion.style.display = 'none';
  }, duracion);
}


    // Array para almacenar los productos obtenidos
    let productos = []; // Definición del array productos

    // Verificar autenticación
    function verificarAutenticacion() {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirigir al login si no hay token
            window.location.href = '/frontend/login.html';
        }
    }

    // Verificar al cargar
    verificarAutenticacion();

    // Verificar si el botón existe antes de añadir el evento
    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', function () {
            tituloModalProducto.textContent = 'Registrar Nuevo Producto';
            document.getElementById('producto-id').value = '';
            formProducto.reset();
            modalProducto.style.display = 'flex';
        });
    }

    // Navegación entre secciones
    menuBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Desactivar todos los botones y secciones
            menuBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Activar el botón y sección seleccionados
            this.classList.add('active');
            const seccionId = this.dataset.section;
            const seccion = document.getElementById(seccionId);

            // Verificar que la sección existe
            if (seccion) {
                seccion.classList.add('active');
            }

            // Si se selecciona la sección de usuarios, actualizarlos
            if (seccionId === 'usuarios') {
                renderizarUsuarios();
            } else if (seccionId === 'productos') {
                renderizarProductos();
            }
        });
    });








    function configurarEventosUsuarios() {
    // Botones de editar
    document.querySelectorAll('.btn-editar-usuario').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE}/admin/usuarios/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Error al obtener datos de usuario');
                
                const usuario = await response.json();
                
                // Llenar formulario
                document.getElementById('usuario-id').value = usuario.id;
                document.getElementById('usuario-nombre').value = usuario.nombre;
                document.getElementById('usuario-correo').value = usuario.email;
                document.getElementById('usuario-telefono').value = usuario.telefono || '';
                document.getElementById('usuario-direccion').value = usuario.direccion || '';
                
                tituloModalUsuario.textContent = 'Editar Usuario';
                modalUsuario.style.display = 'flex';

            } catch (error) {
                console.error('Error:', error);
                mostrarNotificacion('Error al cargar datos del usuario', 'error');
            }
        });
    });

  // Botones de eliminar
    document.querySelectorAll('.btn-eliminar-usuario').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            const token = localStorage.getItem('token');
            
            try {
                // 1. Verificar si tiene pedidos
                const tienePedidos = await verificarPedidosUsuario(id);
                let eliminarPedidos = false;

                // 2. Mostrar confirmación adecuada
                if (tienePedidos) {
                    // Usar confirmación personalizada para mejor UX
                    const confirmacion = confirm(
                        '⚠️ Este usuario tiene pedidos asociados.\n\n' +
                        '¿Desea eliminar al usuario y todos sus pedidos?\n\n' +
                        'Esta acción no se puede deshacer.'
                    );
                    
                    if (!confirmacion) return;
                    eliminarPedidos = true;
                } else {
                    const confirmacion = confirm('¿Está seguro de eliminar este usuario?');
                    if (!confirmacion) return;
                }

                // 3. Enviar solicitud de eliminación
                const url = `${API_BASE}/admin/usuarios/${id}${eliminarPedidos ? '?eliminar_pedidos=true' : ''}`;
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();

                if (!response.ok) {
                    // Manejar error específico de pedidos asociados
                    if (data.error === 'CONFLICT_PEDIDOS') {
                        const confirmacion = confirm(
                            '⚠️ ' + data.message + 
                            '\n\n¿Desea eliminar los pedidos también?\n\n' +
                            'Esta acción no se puede deshacer.'
                        );
                        
                        if (confirmacion) {
                            // Reintentar con eliminación de pedidos
                            const response = await fetch(`${API_BASE}/admin/usuarios/${id}?eliminar_pedidos=true`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            
                            if (!response.ok) throw new Error('Error al eliminar usuario con pedidos');
                            
                            mostrarNotificacion('Usuario y pedidos eliminados correctamente', 'success');
                            renderizarUsuarios();
                        }
                        return;
                    }
                    throw new Error(data.message || 'Error al eliminar usuario');
                }

                mostrarNotificacion(data.message || 'Usuario eliminado correctamente', 'success');
                renderizarUsuarios();

            } catch (error) {
                console.error('Error:', error);
                mostrarNotificacion(error.message || 'Error al eliminar usuario', 'error');
            }
        });
    });
}










    // Funciones de gestión de usuarios
async function renderizarUsuarios() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/usuarios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error: ${response.status}`);
        }

        const usuarios = await response.json();

        // Limpiar tabla
        if (usuariosTable) {
            usuariosTable.innerHTML = '';

            usuarios.forEach(usuario => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${usuario.nombre}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.telefono || '-'}</td>
                    <td>${usuario.direccion || '-'}</td>
                    <td>${usuario.role || 'cliente'}</td>
                    <td>
                        <button class="btn-editar-usuario" data-id="${usuario.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-eliminar-usuario" data-id="${usuario.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                usuariosTable.appendChild(row);
            });

            // Configurar eventos de los botones
            configurarEventosUsuarios();
        }

    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        mostrarNotificacion(`Error al cargar usuarios: ${error.message}`, 'error');

        if (modoPrueba) {
            mostrarUsuariosEjemplo();
        }
    }
}

    // Función para mostrar datos de ejemplo en caso de error
    function mostrarUsuariosEjemplo() {
        if (!usuariosTable) return;

        const usuariosEjemplo = [
            { id: "1", nombre: "Kesly Labio Otero", email: "kesly.labio@gmail.com", telefono: "323 490 7319", direccion: "Carrera 25 #15-50, Medellín" },
            { id: "2", nombre: "Cristina Lopéz", email: "cristina.lopez@gmail.com", telefono: "315 987 6543", direccion: "Calle 10 #20-30, Cartagena" },
            { id: "3", nombre: "Stiven Mendoza", email: "julian.1335@gmail.com", telefono: "311 345 6789", direccion: "Avenida 5 #8-12, Bogotá" }
        ];

        usuariosTable.innerHTML = '';
        usuariosEjemplo.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>${usuario.telefono}</td>
                <td>${usuario.direccion}</td>
                <td>
                    <button class="btn-editar-usuario" data-id="${usuario.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-eliminar-usuario" data-id="${usuario.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            usuariosTable.appendChild(row);
        });

    }




    

        // Función para verificar si un usuario tiene pedidos asociados
async function usuarioTienePedidosAsociados(usuarioId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/pedidos/usuario/${usuarioId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al verificar pedidos del usuario');
        }

        const pedidos = await response.json();
        return pedidos.length > 0;
    } catch (error) {
        console.error('Error verificando pedidos:', error);
        return false; // Asumir que no hay pedidos en caso de error
    }
}



// Función para verificar si un usuario tiene pedidos
async function verificarPedidosUsuario(usuarioId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/usuarios/${usuarioId}/pedidos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al verificar pedidos');
        
        const data = await response.json();
        return data.pedidosCount > 0;
    } catch (error) {
        console.error('Error verificando pedidos:', error);
        return false;
    }
}


    // Manejo de formulario de usuario: actualización y creación con validación y notificaciones
    if (formUsuario) {
        formUsuario.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Usar los IDs correctos para obtener los valores del formulario
            const usuarioId = document.getElementById('usuario-id');
            const usuarioNombre = document.getElementById('usuario-nombre');
            const usuarioCorreo = document.getElementById('usuario-correo');
            const usuarioTelefono = document.getElementById('usuario-telefono');
            const usuarioDireccion = document.getElementById('usuario-direccion');

            const id = usuarioId ? usuarioId.value : '';
            const nombre = usuarioNombre ? usuarioNombre.value : '';
            const email = usuarioCorreo ? usuarioCorreo.value : '';
            const telefono = usuarioTelefono ? usuarioTelefono.value : '';
            const direccion = usuarioDireccion ? usuarioDireccion.value : '';

            // Validar campos obligatorios
            if (!nombre || !email) {
                mostrarNotificacion('Nombre y correo electrónico son obligatorios', 'error');
                return;
            }

            // Crear objeto de datos
            const userData = {
                nombre,
                email,
                telefono,
                direccion,
                contraseña: 'Temporal123', // Asegurar contraseña
                role: 'cliente'
            };

            try {
                const token = localStorage.getItem('token');
                const url = id
                    ? `${API_BASE}/admin/usuarios/${id}`
                    : `${API_BASE}/admin/usuarios`;

                const method = id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error en la operación');
                }

                mostrarNotificacion(
                    id ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
                    'success'
                );

                // Cerrar modal y resetear formulario
                if (modalUsuario) modalUsuario.style.display = 'none';
                formUsuario.reset();

                // Actualizar lista de usuarios
                renderizarUsuarios();

            } catch (error) {
                console.error('Error:', error);
                mostrarNotificacion(`Error: ${error.message}`, 'error');
            }
        });
    }

    // Botón para abrir modal de nuevo usuario
    if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', function () {
            if (tituloModalUsuario) tituloModalUsuario.textContent = 'Registrar Nuevo Usuario';

            const usuarioId = document.getElementById('usuario-id');
            if (usuarioId) usuarioId.value = '';

            if (formUsuario) formUsuario.reset();
            if (modalUsuario) modalUsuario.style.display = 'flex';
        });
    }

    // Botón para cancelar formulario usuario
    if (cancelarUsuario) {
        cancelarUsuario.addEventListener('click', function () {
            if (modalUsuario) modalUsuario.style.display = 'none';
            if (formUsuario) formUsuario.reset();
        });
    }

    // Botón para cerrar sesión
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function () {
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                // Eliminar el token del localStorage
                localStorage.removeItem('token');
                // Redirigir al login
                window.location.href = '/frontend/index.html';
            }
        });
    }

    // Funciones de gestión de productos
   async function renderizarProductos() {
  try {
    // Asignar a la variable global productos
    productos = await fetchProductos();
    
    // Limpiar contenedores
 const categorias = ['bicicletas', 'accesorios', 'repuestos', 'ropa']; 
    categorias.forEach(categoria => {
      const contenedor = document.getElementById(`productos-${categoria}`);
      if (contenedor) contenedor.innerHTML = '';
    });

    // Renderizar productos
    productos.forEach(producto => {
      const productoElemento = document.createElement('div');
      productoElemento.className = 'producto';
      productoElemento.innerHTML = `
        <div class="producto-imagen">
          <img src="${API_BASE}/uploads/productos/${producto.imagen}" alt="${producto.nombre}">
        </div>
        <div class="producto-info">
          <h4>${producto.nombre}</h4>
          <p class="marca">${producto.marca || 'Sin marca'}</p>
          <p class="precio">$${producto.precio.toLocaleString()} COP</p>
          <div class="producto-estado">
            <span class="disponibilidad ${producto.disponibilidad}">
              ${producto.disponibilidad === 'disponible' ? 'Disponible' :
              producto.disponibilidad === 'agotado' ? 'Agotado' : 'Próxima Llegada'}
            </span>
            <span class="stock">Stock: ${producto.stock || 0}</span>
          </div>
        </div>
        <div class="producto-acciones">
         
          <button class="btn-editar-producto" data-id="${producto.id}">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      `;

      const contenedor = document.getElementById(`productos-${producto.categoria}`);
      if (contenedor) contenedor.appendChild(productoElemento);
    });

    // Configurar eventos después de renderizar
    configurarAccionesProductos();

    marcarProductosStockBajo();
    mostrarAlertaStockBajo();

  } catch (error) {
    console.error('Error renderizando productos:', error);
    mostrarNotificacion('Error al cargar productos', 'error');
  }
}



    // Configuración de acciones para productos
    function configurarAccionesProductos() {
  //        // Botones de ver detalles de producto
  // document.querySelectorAll('.btn-ver-producto').forEach(btn => {
  //   btn.addEventListener('click', function() {
  //     const id = this.getAttribute('data-id');
  //     const producto = productos.find(p => p.id.toString() === id);
      
  //     if (!producto) {
  //       mostrarNotificacion('Producto no encontrado', 'error');
  //       return;
  //     }

  //               if (detalleProductoContenido && modalDetalleProducto) {
  //                   detalleProductoContenido.innerHTML = `
  //                   <div class="detalle-producto">
  //                     <div class="detalle-imagen">
  //                       <img src="${API_BASE}/uploads/productos/${producto.imagen}" alt="${producto.nombre}">
  //                     </div>
  //                     <div class="detalle-info">
  //                       <h2>${producto.nombre}</h2>
  //                       <p class="marca"><strong>Marca:</strong> ${producto.marca || 'Sin especificar'}</p>
  //                       <p class="descripcion">${producto.descripcion}</p>
  //                       <div class="detalle-precio">
  //                         <span>Precio: $${producto.precio.toLocaleString()} COP</span>
  //                         <span class="disponibilidad ${producto.disponibilidad}">
  //                           ${producto.disponibilidad === 'disponible' ? 'Disponible' :
  //                           producto.disponibilidad === 'agotado' ? 'Agotado' : 'Próxima Llegada'}
  //                         </span>
  //                         <span class="stock">Stock: ${producto.stock || 0} unidades</span>
  //                       </div>
  //                       <div class="caracteristicas">
  //                         <h3>Características Técnicas</h3>
  //                         <pre>${producto.caracteristicas}</pre>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 `;
  //                   modalDetalleProducto.style.display = 'flex';
  //               }
  //           });
  //       });

        // Botones de editar producto
    // Botones de editar producto
    document.querySelectorAll('.btn-editar-producto').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const producto = productos.find(p => p.id.toString() === id);
            if (!producto) {
                mostrarNotificacion('Producto no encontrado', 'error');
                return;
            }
            
            // Verificar si los elementos existen antes de asignar valores
            const productoId = document.getElementById('producto-id');
            const productoNombre = document.getElementById('producto-nombre');
            const productoCategoria = document.getElementById('producto-categoria');
            const productoMarca = document.getElementById('producto-marca');
            const productoPrecio = document.getElementById('producto-precio');
            const productoStock = document.getElementById('producto-stock');
            const productoDisponibilidad = document.getElementById('producto-disponibilidad');
            const productoDescripcion = document.getElementById('producto-descripcion');
            const productoCaracteristicas = document.getElementById('producto-caracteristicas');

            // Llenar formulario
            if (productoId) productoId.value = producto.id;
            if (productoNombre) productoNombre.value = producto.nombre;
            if (productoCategoria) productoCategoria.value = producto.categoria;
            if (productoMarca) productoMarca.value = producto.marca || '';
            if (productoPrecio) productoPrecio.value = producto.precio;
            
            // AQUÍ ES DONDE DEBE ESTAR EL CÓDIGO DEL STOCK
            if (productoStock) {
                productoStock.value = producto.stock || 0;
                // Establecer el límite máximo (usamos 100 como valor por defecto si no está definido)
                const maxStock = producto.stockMaximo || 100;
                productoStock.setAttribute('data-max', maxStock);
                productoStock.setAttribute('max', maxStock); // Para validación HTML5
                const stockMessage = document.getElementById('stock-message');
                if (stockMessage) {
                    stockMessage.textContent = `Máximo permitido: ${maxStock} unidades`;
                }
            }
            
            if (productoDisponibilidad) productoDisponibilidad.value = producto.disponibilidad;
            if (productoDescripcion) productoDescripcion.value = producto.descripcion;
            if (productoCaracteristicas) productoCaracteristicas.value = producto.caracteristicas;

            // Añadir esto para manejar la imagen
            const imagenPreview = document.getElementById('imagen-preview');
            const imagenActualInput = document.getElementById('imagen-actual');
            
            if (imagenPreview && imagenActualInput) {
                imagenActualInput.value = producto.imagen; // Guardar nombre de imagen actual
                imagenPreview.innerHTML = producto.imagen 
                    ? `<img src="${API_BASE}/uploads/productos/${producto.imagen}" alt="${producto.nombre}" style="max-width: 200px; max-height: 200px;">`
                    : '<p>No hay imagen</p>';
            }

            // Cambiar título del modal
            if (tituloModalProducto) tituloModalProducto.textContent = 'Editar Producto';

            // Mostrar modal
            if (modalProducto) modalProducto.style.display = 'flex';
        });
    });
}
    

    // Cerrar modales con X
    document.querySelectorAll('.cerrar-modal').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function () {
                const modal = this.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        }
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });



    // Función para obtener productos
    async function fetchProductos() {
        try {
            const token = localStorage.getItem('token');

            // Si no hay token, simular un error para usar los productos de ejemplo
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch(`${API_BASE}/api/productos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Error obteniendo productos: ${response.status}`);
                } else {
                    const errorText = await response.text();
                    console.error('Respuesta no JSON:', errorText);
                    throw new Error('Error del servidor: Respuesta no válida');
                }
            }

            return await response.json();
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            throw error;
        }
    }

    if (cancelarProducto) {
        cancelarProducto.addEventListener('click', function () {
            if (modalProducto) modalProducto.style.display = 'none';
            if (formProducto) formProducto.reset();
        });
    }












    // Asegurarte de que el evento submit del formulario de productos esté bien configurado
    if (formProducto) {
    formProducto.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validar campos requeridos
        const camposRequeridos = [
            'producto-nombre',
            'producto-categoria',
            'producto-marca',
            'producto-precio',
            'producto-stock',
            'producto-disponibilidad'
        ];

        let faltantes = [];
        camposRequeridos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento && !elemento.value) {
                const label = elemento.previousElementSibling;
                faltantes.push(label ? label.textContent : id);
            }
        });

        if (faltantes.length > 0) {
            mostrarNotificacion(`Faltan campos: ${faltantes.join(', ')}`, 'error');
            return;
        }

        // Configurar FormData correctamente
        const formData = new FormData(formProducto);
        const productoId = document.getElementById('producto-id').value;
        
        // Convertir y validar valores numéricos
        const precio = parseFloat(formData.get('precio'));
        const stock = parseInt(formData.get('stock'));

        if (isNaN(precio) || precio <= 0 || isNaN(stock) || stock < 0) {
            mostrarNotificacion('Precio y stock deben ser números válidos', 'error');
            return;
        }

        // Si estamos editando, agregar el ID
        if (productoId) {
            formData.append('id', productoId);
        }

        // Agregar imagen actual si existe
        const imagenActual = document.getElementById('imagen-actual').value;
        if (imagenActual) {
            formData.append('imagenActual', imagenActual);
        }

        try {
            const url = productoId 
                ? `${API_BASE}/api/productos/${productoId}`
                : `${API_BASE}/api/productos`;

            const method = productoId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                let errorMessage = 'Error en la operación';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    errorMessage = await response.text();
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            
            mostrarNotificacion(
                productoId ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                'success'
            );

            // Cerrar modal y resetear formulario
            if (modalProducto) modalProducto.style.display = 'none';
            formProducto.reset();

            // Actualizar lista de productos
            await renderizarProductos();

        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    });
}






































    // /* ===================== VENTAS ===================== */

    // Función para actualizar el resumen de ventas

async function actualizarResumenVentas(fechaInicio, fechaFin) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/ventas/historial?fechaInicio=${fechaInicio || ''}&fechaFin=${fechaFin || ''}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        const ventas = await response.json();

        // Cálculos de totales
        const totalVentas = ventas.length;
        const totalIngresos = ventas.reduce((sum, venta) => sum + parseFloat(venta.monto_total), 0);
        const totalProductos = ventas.reduce((sum, venta) =>
            sum + venta.productos.reduce((prodSum, producto) => prodSum + producto.cantidad, 0), 0);

        // Actualizar DOM
        const elementTotalVentas = document.getElementById('total-ventas');
        const elementTotalIngresos = document.getElementById('total-ingresos');
        const elementTotalProductos = document.getElementById('total-productos');

        if (elementTotalVentas) elementTotalVentas.textContent = totalVentas;
        if (elementTotalIngresos) elementTotalIngresos.textContent = `$${totalIngresos.toLocaleString('es-CO')} COP`;
        if (elementTotalProductos) elementTotalProductos.textContent = totalProductos;

        // Actualizar tabla
        const tbody = document.getElementById('ventas-tbody');
        if (tbody) {
            tbody.innerHTML = ventas.map(venta => {
                // Formatear el monto total con puntos y COP
                const montoFormateado = `$${parseFloat(venta.monto_total).toLocaleString('es-CO')} COP`;
                
                // Formatear los productos
                const productosLista = venta.productos.map(p => 
                    `<li>${p.producto_nombre} (${p.cantidad}x $${parseFloat(p.precio_unitario).toLocaleString('es-CO')})</li>`
                ).join('');
                
                return `
                <tr>
                    <td>${venta.id}</td>
                    <td>${new Date(venta.fecha_pedido).toLocaleDateString()}</td>
                    <td>${venta.usuario_nombre || 'Cliente no especificado'}</td>
                    <td>${venta.direccion_envio}</td>
                    <td>
                        <ul>${productosLista}</ul>
                    </td>
                    <td>${montoFormateado}</td>
                </tr>
                `;
            }).join('');

            // Agregar eventos a los botones de detalle
            // document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
            //     btn.addEventListener('click', function (e) {
            //         e.preventDefault();
            //         mostrarNotificacion('🔧 La función de detalle de ventas está en desarrollo', 'info');
            //     });
            // });
        }

    } catch (error) {
        console.error('Error actualizando resumen:', error);
        mostrarNotificacion('Error al cargar datos de ventas: ' + error.message, 'error');
    }
}












    // 1. Configurar el botón de filtrar ventas
const btnFiltrarVentas = document.getElementById('btn-filtrar-ventas');
if (btnFiltrarVentas) {
    btnFiltrarVentas.addEventListener('click', function() {
        const fechaInicio = document.getElementById('fecha-inicio').value;
        const fechaFin = document.getElementById('fecha-fin').value;
        
        // Validación simple de fechas
        if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
            mostrarNotificacion('La fecha de inicio no puede ser mayor que la fecha final', 'error');
            return;
        }
        
        actualizarResumenVentas(fechaInicio, fechaFin);
    });
}

// 2. Función para establecer fechas por defecto (últimos 30 días)
function establecerFechasPorDefecto() {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    // Formatear como YYYY-MM-DD
    const formatoFecha = (fecha) => fecha.toISOString().split('T')[0];
    
    const fechaInicioDefault = formatoFecha(hace30Dias);
    const fechaFinDefault = formatoFecha(hoy);
    
    // Establecer para ambas secciones
    document.getElementById('fecha-inicio').value = fechaInicioDefault;
    document.getElementById('fecha-fin').value = fechaFinDefault;
    document.getElementById('fecha-inicio-productos').value = fechaInicioDefault;
    document.getElementById('fecha-fin-productos').value = fechaFinDefault;
}

// 3. Inicializar la sección de ventas cuando se carga la página
function inicializarSeccionVentas() {
    establecerFechasPorDefecto();
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    
    actualizarResumenVentas(fechaInicio, fechaFin);
    cargarProductosMasVendidos(fechaInicio, fechaFin);
}

// 4. Ejecutar al cargar la página si estamos en la sección de ventas
if (document.querySelector('#ventas-section.active')) {
    inicializarSeccionVentas();
}










    // Función para productos más vendidos
    async function cargarProductosMasVendidos(fechaInicio, fechaFin) {
    try {
        const token = localStorage.getItem('token');
        
        // Validar fechas
        if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
            mostrarNotificacion('La fecha de inicio no puede ser mayor que la fecha final', 'error');
            return;
        }

        const response = await fetch(
            `${API_BASE}/api/ventas/productos-mas-vendidos?fechaInicio=${fechaInicio || ''}&fechaFin=${fechaFin || ''}`, 
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error en la respuesta del servidor');
            }

            const productos = await response.json();
            console.log('🏷️ Productos “más vendidos” del servidor:', productos);

            const contenedor = document.querySelector('.productos-top-categorias');
            if (contenedor) {
                if (productos.length === 0) {
                    contenedor.innerHTML = '<div class="alerta-info">No hay productos vendidos en el periodo seleccionado</div>';
                    return;
                }

                contenedor.innerHTML = productos.map((producto, index) => `
  <div class="categoria-container">
    <h3>${index + 1}. ${producto.producto_nombre}</h3>

    <!-- Nuevos datos -->
    <p><strong>ID Artículo:</strong> ${producto.producto_id}</p>
    <p><strong>Descripción:</strong> ${producto.descripcion || 'No disponible'}</p>
    <p><strong>Última venta:</strong> ${producto.fecha_ultima_venta
                        ? new Date(producto.fecha_ultima_venta).toLocaleDateString()
                        : '—'
                    }</p>

    <table class="tabla-productos">
      <tr>
        <th>Unidades Vendidas</th>
        <th>Precio Unitario</th>
        <th>Ingreso Total</th>
      </tr>
      <tr>
        <td>${producto.total_vendido}</td>
        <td>$${parseFloat(producto.precio).toLocaleString()} COP</td>
        <td>$${(producto.total_vendido * producto.precio).toLocaleString()} COP</td>
      </tr>
    </table>
  </div>
`).join('');




            }
        } catch (error) {
            console.error('Error cargando productos vendidos:', error);
            mostrarNotificacion('Error al cargar productos: ' + error.message, 'error');

            const contenedor = document.querySelector('.productos-top-categorias');
            if (contenedor) {
                contenedor.innerHTML = '<div class="error-mensaje">Error al cargar datos. Intente nuevamente.</div>';
            }
        }
    }

    // Configurar un solo event listener para el botón de filtrar
 const btnFiltrarProductos = document.getElementById('btn-filtrar-productos');
if (btnFiltrarProductos) {
    btnFiltrarProductos.addEventListener('click', () => {
        const fechaInicio = document.getElementById('fecha-inicio-productos').value;
        const fechaFin = document.getElementById('fecha-fin-productos').value;
        cargarProductosMasVendidos(fechaInicio, fechaFin);
    });
}



























    // ====== CORRECCIÓN PARA LA SECCIÓN DE VENTAS Y PRODUCTOS MÁS VENDIDOS ======

    // 1. Corregir ID de sección - asegurar que usamos el nombre correcto del ID
    const ventasSection = document.getElementById('ventas-section');

    // 2. Configurar eventos para las pestañas de ventas
    const ventasTabs = document.querySelectorAll('.ventas-tab');
    const ventasContent = document.querySelectorAll('.ventas-content');

    // Función para cambiar entre pestañas
    function cambiarPestanaVentas() {
    // Desactivar todas las pestañas y contenidos
    ventasTabs.forEach(tab => tab.classList.remove('active'));
    ventasContent.forEach(content => content.classList.remove('active'));

    // Activar la pestaña seleccionada
    this.classList.add('active');

    // Mostrar el contenido correspondiente
    const tabId = this.getAttribute('data-tab');
    const contenidoActivo = document.getElementById(tabId);
    if (contenidoActivo) {
        contenidoActivo.classList.add('active');

        // Cargar datos específicos según la pestaña
        if (tabId === 'productos-vendidos') {
            const fechaInicio = document.getElementById('fecha-inicio-productos').value;
            const fechaFin = document.getElementById('fecha-fin-productos').value;
            cargarProductosMasVendidos(fechaInicio, fechaFin);
        } else if (tabId === 'historial-ventas') {
            inicializarSeccionVentas();
        }
    }
}
    // Asignar eventos a las pestañas
    ventasTabs.forEach(tab => {
        tab.addEventListener('click', cambiarPestanaVentas);
    });

    // 3. Corregir la inicialización de la sección de ventas
    menuBtns.forEach(btn => {
        if (btn.dataset.section === 'ventas-section') {
            btn.addEventListener('click', function () {
                console.log('Inicializando sección de ventas');
                // Inicializar con la primera pestaña activa
                const primeraPestana = document.querySelector('.ventas-tab');
                if (primeraPestana) {
                    primeraPestana.click(); // Simular click en la primera pestaña
                }
            });
        }
    });


    // 2. Función para formatear fecha/hora
   function formatearFechaHora(date) {
    const d = new Date(date);
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`; // Solo hora:minutos
}









    if (btnDescargar) {
        btnDescargar.addEventListener('click', () => {
            // 1. Mismos datos que para imprimir
            const fi = document.getElementById('fecha-inicio').value;
            const ff = document.getElementById('fecha-fin').value;

            fetch(`${API_BASE}/api/ventas/historial?fechaInicio=${fi}&fechaFin=${ff}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
                .then(res => res.json())
                .then(ventas => {
                    // 2. Cabecera CSV
                    const header = ['Fecha', 'ID Venta', 'Cliente', 'Monto'];
                    // 3. Filas: formatea fecha y monto
                    const rows = ventas.map(v => {
                        const fecha = new Date(v.fecha_pedido).toISOString().slice(0, 10);
                        const cliente = v.usuario_nombre || '';
                        const monto = `$${parseFloat(v.monto_total).toLocaleString()}`;
                        return [fecha, v.id, cliente, monto];
                    });
                    // 4. Construir texto CSV
                    const csvContent = [header, ...rows]
                        .map(r => r.join(','))
                        .join('\r\n');
                    // 5. Crear blob y forzar descarga
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ventas_por_cliente_${fi}_a_${ff}.csv`;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                })
                .catch(err => {
                    console.error('Error al descargar reporte:', err);
                    mostrarNotificacion('No se pudo descargar el reporte', 'error');
                });
        });
    }





    // 1. Preparar datos de la gráfica (por cliente o totales por día, según prefieras)
    function renderChart(ventas) {
        const ctx = document.getElementById('chart-ventas').getContext('2d');
        // Ejemplo: total de ventas por fecha
        const agrupado = {};
        ventas.forEach(v => {
            const fecha = new Date(v.fecha_pedido).toISOString().slice(0, 10);
            agrupado[fecha] = (agrupado[fecha] || 0) + parseFloat(v.monto_total);
        });
        const labels = Object.keys(agrupado).sort();
        const data = labels.map(d => agrupado[d]);

        return new Chart(ctx, {
            type: 'line',           // ← aquí cambias 'bar' por 'line'
            data: {
                labels,
                datasets: [{
                    label: 'Monto',
                    data,
                    fill: false,         // no rellenar bajo la línea
                    tension: 0.1         // suaviza curvas (0 = líneas rectas)
                }]
            },
            options: {
                responsive: false,     // canvas oculto no responde automáticamente
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }











    if (btnDescargarPdf) {
    btnDescargarPdf.addEventListener('click', () => {
        // Obtener rangos y datos
        const fi = document.getElementById('fecha-inicio').value;
        const ff = document.getElementById('fecha-fin').value;

        fetch(`${API_BASE}/api/ventas/historial?fechaInicio=${fi}&fechaFin=${ff}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(ventas => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');

                // —— 1. Agregar logo ——
                const logoImg = document.getElementById('logo-report');
                if (logoImg.complete) {
                    doc.addImage(logoImg, 'PNG', 14, 10, 30, 30);
                } else {
                    logoImg.onload = () => {
                        doc.addImage(logoImg, 'PNG', 14, 10, 30, 15);
                    };
                }

                // —— 2. Título y metadatos ——
                doc.setFontSize(16);
                doc.text('Ventas por cliente', 50, 20);
                doc.setFontSize(10);
                doc.text(`Período: ${fi} a ${ff}`, 50, 30);
                doc.text(`Hora de emisión: ${formatearFechaHora(new Date())}`, 50, 35);
                doc.text(`Usuario emisor: ${localStorage.getItem('username') || 'admin_bikestore'}`, 50, 40);

                // —— 3. Generar y dibujar la gráfica con mejor calidad ——
                const chart = renderChart(ventas);
                
                // Aumentar tiempo de espera para asegurar renderizado completo
                setTimeout(() => {
                    const canvas = document.getElementById('chart-ventas');
                    
                    // MEJORAS PARA CALIDAD Y CENTRADO:
                    
                    // 1. Obtener dimensiones del canvas original
                    const originalWidth = canvas.width;
                    const originalHeight = canvas.height;
                    
                    // 2. Crear un canvas temporal con mayor resolución
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    // 3. Escalar para mejor calidad (2x o 3x)
                    const scale = 2;
                    tempCanvas.width = originalWidth * scale;
                    tempCanvas.height = originalHeight * scale;
                    
                    // 4. Escalar el contexto
                    tempCtx.scale(scale, scale);
                    
                    // 5. Dibujar el canvas original en el temporal
                    tempCtx.drawImage(canvas, 0, 0);
                    
                    // 6. Obtener imagen de alta calidad
                    const imgData = tempCanvas.toDataURL('image/png', 1.0); // Calidad máxima
                    
                    // 7. Calcular posición centrada
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const chartWidth = 160; // Ancho deseado de la gráfica
                    const chartHeight = 80; // Alto deseado de la gráfica
                    const xPosition = (pageWidth - chartWidth) / 2; // Centrar horizontalmente
                    
                    // 8. Agregar imagen centrada y con mejor calidad
                    doc.addImage(imgData, 'PNG', xPosition, 45, chartWidth, chartHeight);

                    // —— 4. Preparar tabla y autoTable ——
                    const head = [['Fecha', 'ID Venta', 'Cliente', 'Monto']];
                    const body = ventas.map(v => {
                        const fecha = new Date(v.fecha_pedido).toISOString().slice(0, 10);
                        return [fecha, v.id, v.usuario_nombre || '', `$${parseFloat(v.monto_total).toLocaleString()}`];
                    });
                    
                    doc.autoTable({
                        startY: 135, // Ajustar según nueva posición de gráfica
                        head: head, 
                        body: body,
                        margin: { left: 14, right: 14 },
                        headStyles: { fillColor: [109, 67, 143] }
                    });

                    // —— 5. Numeración de páginas ——
                    const pageCount = doc.getNumberOfPages();
                    for (let i = 1; i <= pageCount; i++) {
                        doc.setPage(i);
                        doc.setFontSize(10);
                        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, null, null, 'right');
                    }

                    // —— 6. Descargar ——
                    doc.save(`ventas_por_cliente_${fi}_a_${ff}.pdf`);
                    
                    // Limpiar canvas temporal
                    tempCanvas.remove();
                    
                }, 800); // Aumentar tiempo de espera para mejor renderizado
            })
            .catch(err => mostrarNotificacion('No se pudo generar el PDF', 'error'));
    });
}








    const btnDescProductos = document.getElementById('btn-descargar-productos');

if (btnDescProductos) {
  btnDescProductos.addEventListener('click', () => {
    // 1. Obtén parámetros de filtrado idénticos
    const fi = document.getElementById('fecha-inicio-productos').value;
    const ff = document.getElementById('fecha-fin-productos').value;
    // 2. Llama al mismo endpoint de “productos-mas-vendidos”
    fetch(`${API_BASE}/api/ventas/productos-mas-vendidos?fechaInicio=${fi}&fechaFin=${ff}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(productos => {
      // 3. Cabecera CSV
      const header = [
        'Posición','ID Artículo','Nombre','Unidades Vendidas',
        'Precio Unitario','Ingreso Total','Descripción','Última Venta'
      ];
      // 4. Filas
      const rows = productos.map((p, i) => {
        const fecha = p.fecha_ultima_venta
          ? new Date(p.fecha_ultima_venta).toISOString().slice(0,10)
          : '';
        const ingreso = p.total_vendido * parseFloat(p.precio);
        return [
          i+1,
          p.producto_id,
          p.producto_nombre,
          p.total_vendido,
          `$${parseFloat(p.precio).toLocaleString()}`,
          `$${ingreso.toLocaleString()}`,
          p.descripcion || '',
          fecha
        ];
      });
      // 5. Generar y disparar descarga
      const csvContent = [header, ...rows]
        .map(r => r.join(','))
        .join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `productos_mas_vendidos_${fi}_a_${ff}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error('Error al descargar reporte de productos:', err);
      mostrarNotificacion('No se pudo descargar el reporte', 'error');
    });
  });
}










const btnDescProductosPdf = document.getElementById('btn-descargar-productos-pdf');

if (btnDescProductosPdf) {
  btnDescProductosPdf.addEventListener('click', () => {
    const fi = document.getElementById('fecha-inicio-productos').value;
    const ff = document.getElementById('fecha-fin-productos').value;

    fetch(`${API_BASE}/api/ventas/productos-mas-vendidos?fechaInicio=${fi}&fechaFin=${ff}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(productos => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p','mm','a4');

      // 1. Logo (reuse tu <img id="logo-report">)
      const logo = document.getElementById('logo-report');
      if (logo.complete) {
        doc.addImage(logo, 'PNG', 14, 10, 30, 30);
      } else {
        logo.onload = () => doc.addImage(logo, 'PNG', 14, 10, 30, 30);
      }

      // 2. Título y metadatos
      doc.setFontSize(16);
      doc.text('Productos Más Vendidos', 50, 20);
      doc.setFontSize(10);
      doc.text(`Período: ${fi} a ${ff}`, 50, 30);
    doc.text(`Hora de emisión: ${formatearFechaHora(new Date())}`, 50, 35);
      doc.text(`Usuario emisor: ${localStorage.getItem('username')||'admin_bikestore'}`, 50, 40);

      // 3. Tabla con autoTable
      const head = [[
        'Pos','ID Artículo','Nombre','Unidades','Precio Unit.','Ingreso Total','Descripción','Última Venta'
      ]];
      const body = productos.map((p,i) => {
        const fecha = p.fecha_ultima_venta
          ? new Date(p.fecha_ultima_venta).toISOString().slice(0,10)
          : '';
        return [
          i+1,
          p.producto_id,
          p.producto_nombre,
          p.total_vendido,
          `$${parseFloat(p.precio).toLocaleString()}`,
          `$${(p.total_vendido * parseFloat(p.precio)).toLocaleString()}`,
          p.descripcion || '',
          fecha
        ];
      });
      doc.autoTable({
        startY:  50, // ajusta según el tamaño de tu gráfica o logo
        head: head,
        body: body,
        margin: { left: 14, right: 14 },
        headStyles: { fillColor: [109, 67, 143] }
      });

      // 4. Numerar páginas
      const pageCount = doc.getNumberOfPages();
      for (let i=1; i<=pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10,
          null, null, 'right'
        );
      }

      // 5. Descargar
      doc.save(`productos_mas_vendidos_${fi}_a_${ff}.pdf`);
    })
    .catch(err => {
      console.error('Error al generar PDF de productos:', err);
      mostrarNotificacion('No se pudo generar el PDF', 'error');
    });
  });
}






async function cargarProductosStockBajo() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/productos/stock-bajo`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Error al cargar productos con stock bajo');
    
    const productos = await response.json();
    const container = document.getElementById('alertas-stock-container');
    
    if (container) {
      if (productos.length === 0) {
        container.innerHTML = '<div class="alerta-info">No hay productos con stock bajo</div>';
      } else {
        container.innerHTML = `
          <div class="alerta-stock">
            <h3>⚠️ Productos con stock bajo</h3>
            <ul>
              ${productos.map(p => `
                <li>
                  ${p.nombre} - <strong>${p.stock} unidades</strong>
                  <button class="btn-editar" data-id="${p.id}">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                </li>
              `).join('')}
            </ul>
          </div>
        `;

        // Configurar botones para editar productos
        document.querySelectorAll('.btn-editar').forEach(btn => {
          btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            // Aquí puedes implementar la lógica para editar el producto
            console.log('Editar producto:', productId);
          });
        });
      }
    }
  } catch (error) {
    console.error('Error al cargar stock bajo:', error);
    mostrarNotificacion('Error al cargar productos con stock bajo', 'error');
  }
}

// Llama esta función cuando se cargue la sección de admin
if (document.querySelector('#admin-section.active')) {
  cargarProductosStockBajo();
  // Actualizar cada 5 minutos
  setInterval(cargarProductosStockBajo, 300000);
}






    // Inicializar la aplicación de administración
    renderizarUsuarios();
    renderizarProductos();
});



















