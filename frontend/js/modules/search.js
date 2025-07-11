// modules/search.js
export function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.search-button');
    
    if (!searchInput) return;

    // Función para realizar la búsqueda
    function realizarBusqueda() {
        const termino = searchInput.value.trim();
        if (!termino) return;

        // Si estamos en el catálogo, buscar directamente
        if (window.location.pathname.includes('catalogo.html')) {
            buscarEnCatalogo(termino);
        } else {
            // Si estamos en otra página, redirigir al catálogo con el término de búsqueda
            window.location.href = `/frontend/catalogo.html?search=${encodeURIComponent(termino)}`;
        }
    }

    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', realizarBusqueda);
    }

    // Buscar al presionar Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            realizarBusqueda();
        }
    });

    // Búsqueda en tiempo real (opcional, se activa después de 3 caracteres)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        const termino = this.value.trim();
        
        // Solo buscar en tiempo real si estamos en el catálogo
        if (window.location.pathname.includes('catalogo.html') && termino.length >= 3) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                buscarEnCatalogo(termino);
            }, 500); // Espera 500ms después de que el usuario deje de escribir
        }
    });
}

// Función para buscar productos en el catálogo
async function buscarEnCatalogo(termino) {
    try {
        console.log(`Buscando productos con término: "${termino}"`);
        
        // Usar directamente el endpoint general ya que el de búsqueda da error 403
        const response = await fetch('http://localhost:3000/api/productos');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos del servidor:', data);
        
        // Verificar si la respuesta es un array o tiene una propiedad con los productos
        let todosLosProductos;
        if (Array.isArray(data)) {
            todosLosProductos = data;
        } else if (data.productos && Array.isArray(data.productos)) {
            todosLosProductos = data.productos;
        } else if (data.data && Array.isArray(data.data)) {
            todosLosProductos = data.data;
        } else {
            console.error('Formato de respuesta inesperado:', data);
            todosLosProductos = [];
        }
        
        // Filtrar productos por el término de búsqueda
        const terminoLower = termino.toLowerCase();
        const productosFiltrados = todosLosProductos.filter(producto => {
            return (
                (producto.nombre && producto.nombre.toLowerCase().includes(terminoLower)) ||
                (producto.marca && producto.marca.toLowerCase().includes(terminoLower)) ||
                (producto.descripcion && producto.descripcion.toLowerCase().includes(terminoLower)) ||
                (producto.categoria && producto.categoria.toLowerCase().includes(terminoLower))
            );
        });
        
        console.log(`Productos encontrados: ${productosFiltrados.length}`);
        
        // Renderizar los productos encontrados
        renderProducts(productosFiltrados);
        
        // Actualizar el título para mostrar los resultados de búsqueda
        const header = document.querySelector('.products-header h1');
        if (header) {
            header.textContent = `RESULTADOS PARA: "${termino}" (${productosFiltrados.length} productos)`;
        }
        
    } catch (error) {
        console.error('Error al buscar productos:', error);
        const productsContainer = document.querySelector('.products-grid');
        if (productsContainer) {
            productsContainer.innerHTML = `<p>Error al buscar productos: ${error.message}. Intente nuevamente.</p>`;
        }
    }
}

// Función para renderizar productos (reutilizada del código existente)
function renderProducts(productos) {
    const productsContainer = document.querySelector('.products-grid');
    if (!productsContainer) {
        console.error('No se encontró el contenedor de productos');
        return;
    }

    // Verificar que productos sea un array
    if (!Array.isArray(productos)) {
        console.error('productos no es un array:', productos);
        productsContainer.innerHTML = '<p>Error en el formato de datos de productos.</p>';
        return;
    }

    if (productos.length === 0) {
        productsContainer.innerHTML = '<p>No se encontraron productos que coincidan con su búsqueda.</p>';
        return;
    }

    productsContainer.innerHTML = productos
        .map(
            (producto) => `
            <div class="product-card">
                    <div class="favorite-container">
                        <i class="favorite-icon far fa-heart"></i>
                    </div>
                    <a href="vista_catalogo.html?id=${producto.id}">
                        <div class="product-image">
                            <img src="${producto.imagen ? `http://localhost:3000/uploads/productos/${producto.imagen}` : '/frontend/img/placeholder-product.jpg'}" alt="${producto.nombre}">
                        </div>
                        <div class="product-info">
                            <div class="pro-marc">${producto.marca || 'Sin marca'}</div>
                            <div class="product-title">${producto.nombre}</div>
                            <div class="product-price">COP ${producto.precio.toLocaleString()}</div>
                            <div class="product-actions">
                                <button class="release-button" data-id="${producto.id}">
                                    <i class="fas fa-shopping-cart"></i> Agregar al carrito
                                </button>
                            </div>
                        </div>
                    </a>
                </div>
            `
        )
        .join("");
}

// Función para obtener parámetros de la URL
export function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Función para inicializar búsqueda desde URL (para cuando se accede directamente al catálogo con parámetro de búsqueda)
export function initSearchFromURL() {
    const searchTerm = getURLParameter('search');
    if (searchTerm) {
        // Actualizar el input de búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchTerm;
        }
        
        // Realizar la búsqueda
        buscarEnCatalogo(searchTerm);
    }
}