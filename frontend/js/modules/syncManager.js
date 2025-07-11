// syncManager.js (nuevo archivo)
import { apiRequest } from './api.js';
import { mostrarMensaje } from './ui.js';

// Función para sincronizar carrito al iniciar sesión
export async function sincronizarCarrito(userId) {
  try {
    // Obtener carrito del localStorage
    const carritoLocal = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carritoLocal.length === 0) {
      // Si no hay carrito local, obtener carrito del servidor
      const response = await apiRequest(`http://localhost:3000/api/cart/${userId}`);

      if (response.ok) {
        const carritoServidor = await response.json();
        // Guardar carrito del servidor en localStorage
        localStorage.setItem('carrito', JSON.stringify(carritoServidor));
        return carritoServidor;
      }
      return [];
    } else {
      // Si hay carrito local, enviarlo al servidor
      for (const item of carritoLocal) {
        await apiRequest(`http://localhost:3000/api/cart/${userId}`, {
          method: 'POST',
          body: JSON.stringify({
            producto_nombre: item.nombre,
            precio: item.precio.replace(/[^\d]/g, ""),
            imagen: item.imagen,
            cantidad: item.cantidad || 1
          })
        });
      }
      return carritoLocal;
    }
  } catch (error) {
    console.error('Error al sincronizar carrito:', error);
    mostrarMensaje('Error al sincronizar el carrito', 3000);
    return [];
  }
}

// Función para sincronizar favoritos al iniciar sesión
export async function sincronizarFavoritos(userId) {
  try {
    // Obtener favoritos del localStorage
    const favoritosLocal = JSON.parse(localStorage.getItem('favoritos')) || [];

    if (favoritosLocal.length === 0) {
      // Si no hay favoritos locales, obtener favoritos del servidor
      const response = await apiRequest(`http://localhost:3000/api/favorites/${userId}`);

      if (response.ok) {
        const favoritosServidor = await response.json();
        // Guardar favoritos del servidor en localStorage
        localStorage.setItem('favoritos', JSON.stringify(favoritosServidor));
        return favoritosServidor;
      }
      return [];
    } else {
      // Si hay favoritos locales, enviarlos al servidor
      for (const item of favoritosLocal) {
        await apiRequest(`http://localhost:3000/api/favorites/${userId}`, {
          method: 'POST',
          body: JSON.stringify({
            producto_nombre: item.nombre,
            precio: item.precio.replace(/[^\d]/g, ""),
            imagen: item.imagen
          })
        });
      }
      return favoritosLocal;
    }
  } catch (error) {
    console.error('Error al sincronizar favoritos:', error);
    mostrarMensaje('Error al sincronizar los favoritos', 3000);
    return [];
  }
}

// Función para actualizar el carrito en la base de datos
export async function actualizarCarritoEnBD(item, accion) {
  const token = localStorage.getItem('token');

  if (!token) return false; // Si no hay token, solo usar localStorage

  try {
    // Decodificar el token para obtener el ID del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;

    let endpoint = `http://localhost:3000/api/cart/${userId}`;
    let method = 'POST';

    if (accion === 'agregar' || accion === 'actualizar') {
      method = accion === 'agregar' ? 'POST' : 'PUT';
      
      // Ensure precio is a string before attempting to use replace
      const precioFormatted = typeof item.precio === 'string' 
        ? item.precio.replace(/[^\d]/g, "") 
        : String(item.precio);
        
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          producto_id: item.id,
          producto_nombre: item.nombre,
          precio: precioFormatted,
          imagen: item.imagen || '',
          cantidad: item.cantidad || 1
        })
      });
    } else if (accion === 'eliminar') {
      endpoint = `http://localhost:3000/api/cart/${userId}/${encodeURIComponent(item.nombre)}`;
      method = 'DELETE';
      await apiRequest(endpoint, { method });
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar carrito en BD:', error);
    return false;
  }
}

// Función para actualizar favoritos en la base de datos
export async function actualizarFavoritoEnBD(item, accion) {
  const token = localStorage.getItem('token');

  if (!token) return false; // Si no hay token, solo usar localStorage

  try {
    // Decodificar el token para obtener el ID del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;

    let endpoint = `http://localhost:3000/api/favorites/${userId}`;
    let method = 'POST';

    if (accion === 'agregar') {
      // Ensure precio is a string before attempting to use replace
      const precioFormatted = typeof item.precio === 'string' 
        ? item.precio.replace(/[^\d]/g, "") 
        : String(item.precio);
        
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          producto_nombre: item.nombre,
          precio: precioFormatted,
          imagen: item.imagen || ''
        })
      });
    } else if (accion === 'eliminar') {
      endpoint = `http://localhost:3000/api/favorites/${userId}/${encodeURIComponent(item.nombre)}`;
      method = 'DELETE';
      await apiRequest(endpoint, { method });
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar favorito en BD:', error);
    return false;
  }
}