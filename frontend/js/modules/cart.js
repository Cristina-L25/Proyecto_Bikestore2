// cart.js (versión corregida)

import { mostrarMensaje } from './ui.js';
import { actualizarCarritoEnBD } from './syncManager.js';

// Límites configurables
const MAX_PRODUCTOS_EN_CARRITO = 15; // Límite de productos diferentes
const MAX_CANTIDAD_POR_PRODUCTO = 10; // Límite de unidades por producto

// Función para convertir precio con formato a número
function convertirPrecioANumero(precio) {
  if (typeof precio === 'number') {
    return precio;
  }
  
  if (typeof precio === 'string') {
    // Remover "COP", "$", espacios y convertir puntos de miles a formato numérico
    let precioLimpio = precio
      .replace(/COP\s*\$?/gi, '')  // Remover "COP $"
      .replace(/\$/g, '')          // Remover $
      .trim();                     // Remover espacios
    
    // Si tiene puntos como separadores de miles (ej: 2.500.000)
    if (precioLimpio.includes('.') && !precioLimpio.includes(',')) {
      // Contar puntos
      const puntos = (precioLimpio.match(/\./g) || []).length;
      
      // Si hay más de un punto, probablemente son separadores de miles
      if (puntos > 1) {
        precioLimpio = precioLimpio.replace(/\./g, '');
      }
    }
    
    // Si tiene comas como separadores decimales (ej: 2500,50)
    if (precioLimpio.includes(',')) {
      precioLimpio = precioLimpio.replace(',', '.');
    }
    
    const numero = parseFloat(precioLimpio);
    return isNaN(numero) ? 0 : numero;
  }
  
  return 0;
}

export function initCarrito() {
  document.querySelectorAll('.add-to-cart, .release-button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productCard = this.closest('.product-card, .release-card');
      
      // Obtener datos incluyendo el ID
      const productId = button.getAttribute('data-id');
      const productName = productCard.querySelector('.product-title, .release-title').textContent;
      const productPrice = productCard.querySelector('.product-price, .release-price').textContent;
      const productImage = productCard.querySelector('img')?.src || '';

      // Pasar el ID al carrito
      agregarAlCarrito({ 
        id: productId,
        nombre: productName,
        precio: productPrice,
        imagen: productImage
      });
    });
  });
}

export function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const totalCantidad = carrito.reduce((suma, item) => suma + (item.cantidad || 1), 0);
  const badge = document.querySelector(".cart-icon .badge");
  if (badge) {
    badge.textContent = totalCantidad;
  }
}

// Función para agregar productos al carrito
export function agregarAlCarrito(producto) {
  // Verificar si el producto tiene ID válido
  if (!producto.id) {
    mostrarMensaje('Error: Producto no válido', 'error');
    throw new Error('El producto no tiene un ID válido');
  }

  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  // Verificar límite de productos diferentes
  if (carrito.length >= MAX_PRODUCTOS_EN_CARRITO && 
      !carrito.some(item => item.id === producto.id)) {
    mostrarMensaje(`Límite alcanzado: Máximo ${MAX_PRODUCTOS_EN_CARRITO} productos diferentes en el carrito`, 'error');
    return carrito;
  }

  // Buscar producto existente
  const productoExistenteIndex = carrito.findIndex(item => item.id === producto.id);

  if (productoExistenteIndex !== -1) {
    // Verificar límite de cantidad por producto
    if (carrito[productoExistenteIndex].cantidad >= MAX_CANTIDAD_POR_PRODUCTO) {
      mostrarMensaje(
        `Límite alcanzado: Máximo ${MAX_CANTIDAD_POR_PRODUCTO} unidades por producto`,
        'error'
      );
      return carrito;
    }
    
    // Incrementar cantidad si no supera el límite
    carrito[productoExistenteIndex].cantidad += 1;
    mostrarMensaje(
      `${producto.nombre} - Cantidad: ${carrito[productoExistenteIndex].cantidad}`,
      'success'
    );
  } else {
    // Agregar nuevo producto
    carrito.push({ ...producto, cantidad: 1 });
    mostrarMensaje(`${producto.nombre} agregado al carrito`, 'success');
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
  
  // Sincronizar con BD si hay usuario logueado
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      actualizarCarritoEnBD(
        productoExistenteIndex !== -1 
          ? carrito[productoExistenteIndex] 
          : { ...producto, cantidad: 1 },
        productoExistenteIndex !== -1 ? 'actualizar' : 'agregar'
      );
    } catch (error) {
      console.error('Error al sincronizar con BD:', error);
    }
  }
  
  return carrito;
}

export function actualizarCarritoModal() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItemsContainer || !cartTotal) return;

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let total = 0;
  cartItemsContainer.innerHTML = "";

  if (carrito.length === 0) {
    cartItemsContainer.innerHTML = "<p>Tu carrito está vacío</p>";
    cartTotal.innerHTML = "Total: COP $0";
    return;
  }

  carrito.forEach((producto, index) => {
    // Usar la función de conversión de precios
    const precioNumerico = convertirPrecioANumero(producto.precio);
    total += precioNumerico * (producto.cantidad || 1);

    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    itemDiv.innerHTML = `
      <div class="item-image">
        <img src="${producto.imagen || 'img/placeholder.jpg'}" alt="${producto.nombre}">
      </div>
      <div class="item-details">
        <h4>${producto.nombre}</h4>
        <p>COP $${precioNumerico.toLocaleString()}</p>
        <div class="quantity-controls">
          <button class="decrement" data-index="${index}">-</button>
          <span class="quantity">${producto.cantidad || 1}</span>
          <button class="increment" data-index="${index}">+</button>
        </div>
      </div>
      <button class="remove-item" data-index="${index}">×</button>
    `;

    cartItemsContainer.appendChild(itemDiv);
  });

  cartTotal.innerHTML = `<strong>Total: COP $${total.toLocaleString()}</strong>
    <a href="/frontend/compra.html" class="checkout-btn">Finalizar compra</a>`;

  // Agregar event listener para eliminar productos (asegurando que no se cierre el modal)
  document.querySelectorAll(".remove-item").forEach(button => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      eliminarDelCarrito(parseInt(this.dataset.index));
    });
  });

  // Agregar event listener para incrementar cantidad
  document.querySelectorAll(".increment").forEach(button => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      incrementarCantidad(parseInt(this.dataset.index));
    });
  });

  // Agregar event listener para decrementar cantidad
  document.querySelectorAll(".decrement").forEach(button => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      decrementarCantidad(parseInt(this.dataset.index));
    });
  });
}

export function incrementarCantidad(index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  
  if (!carrito[index]) return;

  // Verificar límite antes de incrementar
  if (carrito[index].cantidad >= MAX_CANTIDAD_POR_PRODUCTO) {
    mostrarMensaje(
      `Límite alcanzado: Máximo ${MAX_CANTIDAD_POR_PRODUCTO} unidades por producto`,
      'error'
    );
    return;
  }

  carrito[index].cantidad += 1;
  localStorage.setItem("carrito", JSON.stringify(carrito));

  // Actualizar UI
  actualizarCarritoModal();
  actualizarContadorCarrito();
  
  // Mostrar feedback al usuario
  mostrarMensaje(
    `${carrito[index].nombre} - Cantidad: ${carrito[index].cantidad}`,
    'info'
  );

  // Sincronizar con BD
  actualizarCarritoEnBD(carrito[index], 'actualizar');
}

export function decrementarCantidad(index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carrito[index]) {
    carrito[index].cantidad = (carrito[index].cantidad || 1) - 1;

    // Si la cantidad baja de 1, se puede eliminar el producto del carrito
    if (carrito[index].cantidad < 1) {
      // Guardar referencia antes de eliminar
      const itemEliminado = carrito[index];
      carrito.splice(index, 1);

      // Actualizar en BD que se eliminó
      actualizarCarritoEnBD(itemEliminado, 'eliminar');
    } else {
      // Si solo se decrementó, actualizar en BD
      actualizarCarritoEnBD(carrito[index], 'actualizar');
    }
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarritoModal();
  actualizarContadorCarrito();
}

export function eliminarDelCarrito(index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const itemEliminado = carrito[index]; // Guardamos referencia al item que eliminaremos
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  actualizarCarritoModal();
  actualizarContadorCarrito();

  // Intentar actualizar en base de datos si hay sesión activa
  actualizarCarritoEnBD(itemEliminado, 'eliminar');
}