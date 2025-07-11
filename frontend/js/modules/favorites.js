// favorites.js

// Importamos funciones de otros módulos
import { mostrarMensaje } from './ui.js';
import { actualizarContadorCarrito } from './cart.js'; // Para usarla en agregarFavoritoAlCarrito()
import { actualizarFavoritoEnBD } from './syncManager.js';



/**
 * Activa los íconos de favoritos en las tarjetas y sincroniza el ícono
 * según el estado de cada producto (favorito o no).
 */
export function activarBotonesFavoritos() {
  // Selecciona todos los íconos de favoritos en las tarjetas
  const favIcons = document.querySelectorAll(".favorite-icon");

  favIcons.forEach(icon => {
    // Obtener la tarjeta padre (release o product)
    const card = icon.closest(".release-card, .product-card");
    if (!card) return;

    const productTitle = card.querySelector(".release-title, .product-title").textContent;
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    const esFavorito = favoritos.some(item => item.nombre === productTitle);

    // Actualiza el ícono según el estado
    if (esFavorito) {
      icon.classList.remove("far");
      icon.classList.add("fas");
    } else {
      icon.classList.remove("fas");
      icon.classList.add("far");
    }

    // Agregar evento para marcar/desmarcar favorito
    icon.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleFavorito(card);
    });
  });
}

/**
 * Alterna el estado de favorito de un producto (lo agrega o lo quita).
 */
export function toggleFavorito(productoCard) {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const titulo = productoCard.querySelector(".release-title, .product-title").textContent;
  const precio = productoCard.querySelector(".release-price, .product-price").textContent;
  const imagen = productoCard.querySelector(".release-image img, .product-image img")?.src || "";
  const favIcon = productoCard.querySelector(".favorite-icon");

  const index = favoritos.findIndex(item => item.nombre === titulo);

  if (index === -1) {
    // Agregar a favoritos
    const nuevoFavorito = {
      nombre: titulo,
      precio: precio,
      imagen: imagen
    };

    favoritos.push(nuevoFavorito);

    if (favIcon) {
      favIcon.classList.remove("far");
      favIcon.classList.add("fas");
    }
    mostrarMensaje("¡Producto agregado a favoritos!");

    // Intentar actualizar en base de datos
    actualizarFavoritoEnBD(nuevoFavorito, 'agregar');
  } else {
    // Guardar referencia al favorito que vamos a eliminar
    const favoritoEliminado = favoritos[index];

    // Quitar de favoritos
    favoritos.splice(index, 1);
    if (favIcon) {
      favIcon.classList.remove("fas");
      favIcon.classList.add("far");
    }
    mostrarMensaje("Producto eliminado de favoritos");

    // Intentar actualizar en base de datos
    actualizarFavoritoEnBD(favoritoEliminado, 'eliminar');
  }

  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  actualizarContadorFavoritos();
  cargarFavoritosEnModal();
}

/**
 * Actualiza el contador numérico en el ícono de favoritos (header).
 */
export function actualizarContadorFavoritos() {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const totalFavoritos = favoritos.length;
  const badge = document.querySelector("#favoritesIcon .badge");

  if (badge) {
    badge.textContent = totalFavoritos;
  }
}

/**
 * Carga la lista de favoritos en el modal de favoritos.
 */
export function cargarFavoritosEnModal() {
  const favoritosContainer = document.getElementById("favorites-items");
  if (!favoritosContainer) return;

  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  favoritosContainer.innerHTML = "";

  if (favoritos.length === 0) {
    favoritosContainer.innerHTML = "<p>No tienes productos favoritos.</p>";
    return;
  }

  favoritos.forEach((producto, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
     itemDiv.innerHTML = `
      <div class="item-image">
        <img src="${producto.imagen || 'img/placeholder.jpg'}" alt="${producto.nombre}">
      </div>
      <div class="item-details">
        <h4>${producto.nombre}</h4>
        <p>${producto.precio}</p>
        <button class="release-button" data-id="${producto.id}">
                                    <i class="fas fa-shopping-cart"></i> Agregar al carrito
                                </button>
      </div>
      <button class="remove-item" data-index="${index}">×</button>
    `;
    favoritosContainer.appendChild(itemDiv);
  });

  // Asignar eventos a los botones para eliminar favoritos
  document.querySelectorAll("#favorites-items .remove-item").forEach(button => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Evitar propagación para que no se cierre el modal
      eliminarFavorito(parseInt(this.dataset.index));
    });
  });

  // Asignar eventos a los botones para añadir al carrito
  document.querySelectorAll("#favorites-items .add-to-cart-btn").forEach(button => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Evitar propagación para que no se cierre el modal
      agregarFavoritoAlCarrito(parseInt(this.dataset.index));
    });
  });
}

/**
 * Elimina un producto de favoritos, dado su índice en el array.
 */
export function eliminarFavorito(index) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const productoEliminado = favoritos[index];
  favoritos.splice(index, 1);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  mostrarMensaje(`${productoEliminado.nombre} eliminado de favoritos`);
  actualizarContadorFavoritos();
  cargarFavoritosEnModal();

  // Actualizar el estado del corazón en todas las tarjetas
  actualizarEstadoCorazones();

  // Intentar actualizar en base de datos
  actualizarFavoritoEnBD(productoEliminado, 'eliminar');
}

export function actualizarEstadoCorazones() {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const favIcons = document.querySelectorAll(".favorite-icon");

  favIcons.forEach(icon => {
    const card = icon.closest(".release-card, .product-card");
    if (!card) return;

    const productTitle = card.querySelector(".release-title, .product-title").textContent;
    const esFavorito = favoritos.some(item => item.nombre === productTitle);

    if (esFavorito) {
      icon.classList.remove("far");
      icon.classList.add("fas");
    } else {
      icon.classList.remove("fas");
      icon.classList.add("far");
    }
  });
}

/**
 * Agrega un producto de favoritos al carrito.
 */
export function agregarFavoritoAlCarrito(index) {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const producto = favoritos[index];

  if (!producto) {
    console.error("Producto no encontrado en favoritos");
    return;
  }

  // Obtenemos el carrito actual
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Verificamos si el producto ya está en el carrito
  const productoExistente = carrito.find(item => item.nombre === producto.nombre);

  if (productoExistente) {
    // Si ya está en el carrito, mostrar mensaje y no hacer nada más
    mostrarMensaje("El producto ya está en el carrito");
    return;
  }

  // Si no existe, lo agregamos con cantidad 1
  carrito.push({
    nombre: producto.nombre,
    precio: producto.precio,
    imagen: producto.imagen,
    cantidad: 1
  });

  // Guardamos el carrito actualizado
  localStorage.setItem("carrito", JSON.stringify(carrito));

  // Actualizamos el contador del carrito
  import('./cart.js').then(module => {
    module.actualizarContadorCarrito();
    mostrarMensaje("¡Producto agregado al carrito!");
  }).catch(err => {
    console.error("Error al actualizar carrito:", err);
  });
}
