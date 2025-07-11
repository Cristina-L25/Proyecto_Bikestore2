// Importar el módulo de búsqueda
import { initSearch, initSearchFromURL } from './search.js';

document.addEventListener("DOMContentLoaded", () => {
    const applyBtn = document.getElementById("filtrar-prod");
    const clearBtn = document.getElementById("clear-filters");
    const productsContainer = document.querySelector(".products-grid");

    // Inicializar búsqueda
    initSearch();

    // Verificar si hay parámetros de búsqueda en la URL
    initSearchFromURL();

    // Estado de carga
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<p>Cargando productos...</p>';

    // Mostrar carga
    function showLoading() {
        productsContainer.innerHTML = '';
        productsContainer.appendChild(loadingIndicator);
    }

    // Si no hay búsqueda en la URL, cargar productos iniciales
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('search')) {
        loadProducts();
    }

    // Función para cargar productos
    async function loadProducts(filters = {}) {
        showLoading();

        try {
            let url = 'http://localhost:3000/api/catalog';
            if (Object.keys(filters).length > 0) {
                const queryParams = new URLSearchParams();
                for (const [key, value] of Object.entries(filters)) {
                    // if (value.length) queryParams.append(key, value.join(','));
                    if (value.length) {
                        value.forEach(v => queryParams.append(key, v));
                     }
                }
                url = `http://localhost:3000/api/catalog/filtrar?${queryParams.toString()}`;
            }


            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const productos = await response.json();
            console.log("📦 Productos recibidos del backend:", productos);
            renderProducts(productos);
        } catch (error) {
            showError();
        }
    }

    // Mostrar error
    function showError() {
        productsContainer.innerHTML = `
            <div class="error-message">
                <p>Error al cargar los productos.</p>
                <button onclick="window.location.reload()">Reintentar</button>
            </div>
        `;
    }

    // Renderizar productos
    function renderProducts(productos) {
        if (!productos || productos.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">No se encontraron productos con los filtros seleccionados.</p>';
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

        // Agregar event listeners después de renderizar (Para el carrito)
    }

    // Obtener filtros seleccionados
    function getSelectedFilters() {
        const filters = {
            categorias: [],
            marcas: [],
            precios: []
        };

        try {
            const filterGroups = document.querySelectorAll('.filter-group');

            if (!filterGroups || filterGroups.length === 0) {
                return filters;
            }

            filterGroups.forEach(group => {
                try {
                    const groupTitleElement = group.querySelector('h3');
                    if (!groupTitleElement) {
                        console.warn('Grupo de filtros sin título h3:', group);
                        return;
                    }

                    const groupTitle = groupTitleElement.textContent || '';
                    const checkboxes = group.querySelectorAll('input:checked');

                    checkboxes.forEach(checkbox => {
                        try {
                            const label = checkbox.closest('label');
                            let value = '';

                            if (checkbox.value && checkbox.value.trim()) {
                                value = checkbox.value.trim();
                            } else if (label && label.textContent) {
                                value = label.textContent.trim();
                            }

                            // const value = checkbox.value || (label.textContent || '').trim();
                            value = checkbox.value.trim();

                            if (!value) return;

                            if (groupTitle.includes('Categorías')) {
                                filters.categorias.push(value);
                            } else if (groupTitle.includes('Marca')) {
                                filters.marcas.push(value);
                            } else if (groupTitle.includes('Precio')) {
                                filters.precios.push(value);
                            }
                        } catch (e) {
                            console.error('Error procesando checkbox:', e);
                        }
                    });
                } catch (e) {
                    console.error('Error procesando grupo de filtros:', e);
                }
            });
        } catch (e) {
            console.error('Error grave en getSelectedFilters:', e);
        }
        return filters;
    }

    // Evento para aplicar filtros
    applyBtn.addEventListener("click", () => {
        const selectedFilters = getSelectedFilters();
        console.log("Filtros seleccionados desde frontend:", selectedFilters);

        loadProducts(selectedFilters);
    });

    // Evento para limpiar filtros
    clearBtn.addEventListener("click", () => {
        document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => cb.checked = false);
        loadProducts();
    });


    // Crear botón hamburguesa para filtros
    const createFilterToggle = () => {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'filter-toggle';
        toggleButton.innerHTML = 'Filtros';
        toggleButton.setAttribute('aria-label', 'Mostrar filtros');
        return toggleButton;
    };

    // Crear overlay para cerrar filtros
    const createOverlay = () => {
        const overlay = document.createElement('div');
        overlay.className = 'filters-overlay';
        return overlay;
    };

    // Inicializar elementos
    const filtersContainer = document.querySelector('.filters');
    const productsSection = document.querySelector('.products-section');

    if (!filtersContainer || !productsSection) return;

    // Crear e insertar botón toggle
    const toggleButton = createFilterToggle();
    productsSection.insertBefore(toggleButton, productsSection.firstChild);

    // Crear e insertar overlay
    const overlay = createOverlay();
    document.body.appendChild(overlay);

    // Función para mostrar filtros
    const showFilters = () => {
        filtersContainer.classList.add('show');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    };

    // Función para ocultar filtros
    const hideFilters = () => {
        filtersContainer.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = ''; // Restaurar scroll
    };

    // Event listeners
    toggleButton.addEventListener('click', showFilters);
    overlay.addEventListener('click', hideFilters);

    // Cerrar filtros con el botón X (usando el pseudo-elemento ::before)
    filtersContainer.addEventListener('click', (e) => {
        const rect = filtersContainer.getBoundingClientRect();
        const closeButtonArea = {
            left: rect.right - 40,
            right: rect.right,
            top: rect.top,
            bottom: rect.top + 40
        };

        if (e.clientX >= closeButtonArea.left &&
            e.clientX <= closeButtonArea.right &&
            e.clientY >= closeButtonArea.top &&
            e.clientY <= closeButtonArea.bottom) {
            hideFilters();
        }
    });

    // Cerrar filtros con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filtersContainer.classList.contains('show')) {
            hideFilters();
        }
    });

    // Manejar cambio de tamaño de ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && filtersContainer.classList.contains('show')) {
            hideFilters();
        }
    });
});