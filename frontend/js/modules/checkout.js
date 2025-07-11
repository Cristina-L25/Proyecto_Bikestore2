import { apiRequest } from './api.js';
import { mostrarMensaje } from './ui.js';
import { actualizarContadorCarrito } from './cart.js';


export function initCheckout() {

  // Mostrar u ocultar subcampos PSE según selección interna
const pseOpcion = document.getElementById('pse-opcion');
if (pseOpcion) {
  pseOpcion.addEventListener('change', function () {
    const banco = document.getElementById('pse-banco');
    const billetera = document.getElementById('pse-billetera');

    // Ocultar ambos subpaneles
    if (banco) banco.style.display = 'none';
    if (billetera) billetera.style.display = 'none';

    // Mostrar el que corresponda
    if (this.value === 'banco') {
      if (banco) banco.style.display = 'block';
    } else if (this.value === 'billetera') {
      if (billetera) billetera.style.display = 'block';
    }
  });
}


  const form = document.getElementById('checkout-form');
  if (!form) return;

  console.log('Inicializando checkout...'); // Para depuración

  // Cargar items del carrito
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  actualizarResumenPedido(carrito);

  // Manejar cambio de método de pago
  document.querySelectorAll('input[name="metodo_pago"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.checkout-payment-details').forEach(div => {
        div.style.display = 'none';
      });
      
      // Verificar si el elemento existe antes de intentar mostrarlo
      const paymentFields = document.getElementById(`${e.target.value}-fields`);
      if (paymentFields) {
        paymentFields.style.display = 'block';
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    


    
    const token = localStorage.getItem('token');
    if (!token) {
      mostrarMensaje('Debes iniciar sesión para comprar', 3000);
      return;
    }

    // Preparar los items del carrito con formato correcto para el backend
    const itemsFormateados = carrito.map(item => {
      // Convertir precio a número eliminando formato de moneda
      let precioNumerico = convertirPrecioANumero(item.precio);
      
      return {
        id: item.id || 0, // Asegurar que siempre haya un id
        nombre: item.nombre,
        cantidad: item.cantidad || 1,
        precio: precioNumerico,
        // No calculamos subtotal aquí, dejamos que el backend lo haga
      };
    });

    const formData = {
      direccion: `${form['checkout-direccion'].value}, ${form['ciudad'].value}, ${form['departamento'].value}`,
      metodo_pago: form.querySelector('input[name="metodo_pago"]:checked').value,
      notas: form.notas.value,
      info_contacto: {
        nombre: form['checkout-nombre'].value,
        email: form['checkout-email'].value,
        telefono: form['checkout-telefono'].value
      },
      items: itemsFormateados,
      total: calcularTotal(carrito)
    };

    try {
      console.log('Enviando datos de checkout:', formData); // Para depuración
      
      const response = await apiRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        mostrarConfirmacion(data);
        localStorage.removeItem('carrito');
        actualizarContadorCarrito();
      } else {
        const errorData = await response.json().catch(() => ({}));
        mostrarMensaje(`Error al procesar el pago: ${errorData.error || response.statusText}`, 3000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      mostrarMensaje('Error de conexión al procesar el pago', 3000);
    }
  });
}

// Nueva función para convertir cualquier formato de precio a número
function convertirPrecioANumero(precio) {
  if (typeof precio === 'number') {
    return precio;
  }
  
  if (typeof precio === 'string') {
    // Eliminar todos los caracteres excepto dígitos
    const precioLimpio = precio.replace(/[^\d]/g, '');
    
    // Convertir a número entero
    return parseInt(precioLimpio, 10);
  }
  
  return 0; // Valor por defecto si no es número ni string
}
function calcularTotal(carrito) {
  const subtotal = carrito.reduce((total, item) => {
    // Usar la nueva función para convertir precio
    const precioNumerico = convertirPrecioANumero(item.precio);
    const cantidad = item.cantidad || 1;
    
    // Precisión en la multiplicación
    return total + (precioNumerico * cantidad);
  }, 0);
  
  const iva = subtotal * 0.19;
  const total = subtotal + iva + 12000; // Subtotal + IVA + envío
  
  // Retornar con precisión de 2 decimales
  return parseFloat(total.toFixed(2));
}

function actualizarResumenPedido(carrito) {
  const container = document.getElementById('order-items');
  if (!container) {
    console.error('No se encontró el contenedor de items del pedido');
    return;
  }

  // Calcular totales
  let subtotal = 0;
  
  carrito.forEach(item => {
    const precioNumerico = convertirPrecioANumero(item.precio);
    const cantidad = item.cantidad || 1;
    subtotal += precioNumerico * cantidad;
  });

  const iva = subtotal * 0.19;
  const envio = 12000;
  const total = subtotal + iva + envio;

  // Generar el HTML para cada item
  container.innerHTML = carrito.map(item => {
    const precioNumerico = convertirPrecioANumero(item.precio);
    const cantidad = item.cantidad || 1;
    
    return `
      <div class="order-item">
        <img src="${item.imagen}" alt="${item.nombre}" width="60">
        <div>
          <h4>${item.nombre}</h4>
          <p>${cantidad} x COP $${precioNumerico.toLocaleString('es-CO')}</p>
        </div>
      </div>
    `;
  }).join('');

  // Actualizar totales, asegurando que muestren el formato de precio correcto
  document.getElementById('subtotal').textContent = `COP $${Math.round(subtotal).toLocaleString('es-CO')}`;
  document.getElementById('tax').textContent = `COP $${Math.round(iva).toLocaleString('es-CO')}`;
  document.getElementById('total').textContent = `COP $${Math.round(total).toLocaleString('es-CO')}`;
}

function mostrarConfirmacion(data) {
  const modal = document.getElementById('confirmation-modal');
  if (!modal) {
    console.error('No se encontró el modal de confirmación');
    return;
  }
  
  modal.style.display = 'block';
  
  document.getElementById('order-number').textContent = data.orderId;
  
  // Obtener el método de pago seleccionado para mostrarlo
  const metodoPago = document.querySelector('input[name="metodo_pago"]:checked');
  const metodoTexto = metodoPago ? metodoPago.value : 'No especificado';
  document.getElementById('payment-method').textContent = metodoTexto;
  
  // Mostrar dirección de envío
  const direccion = document.getElementById('checkout-direccion').value;
  const ciudad = document.getElementById('ciudad').value;
  const departamento = document.getElementById('departamento').value;
  const direccionCompleta = `${direccion}, ${ciudad}, ${departamento}`;
  document.getElementById('shipping-address').textContent = direccionCompleta;
  
  // Mostrar total en formato correcto
  const total = typeof data.total === 'number' ? data.total : parseFloat(data.total);
  document.getElementById('confirmation-total').textContent = `COP $${Math.round(total).toLocaleString('es-CO')}`;
  
  // Cerrar modal
  document.querySelector('.close').addEventListener('click', () => {
    modal.style.display = 'none';
    window.location.href = '/frontend/index.html'; // Redireccionar al inicio
  });
}

// Mapeo completo de ciudades por departamento en Colombia
const ciudadesPorDepartamento = {
    "Amazonas": ["Leticia", "Puerto Nariño"],
    "Antioquia": ["Medellín", "Envigado", "Itagüí", "Bello", "Rionegro", "Sabaneta", "La Ceja"],
    "Arauca": ["Arauca", "Arauquita", "Saravena"],
    "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia", "Sabanalarga"],
    "Bogotá D.C.": ["Bogotá D.C"],
    "Bolívar": ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar", "Arjona"],
    "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa"],
    "Caldas": ["Manizales", "La Dorada", "Villamaría"],
    "Caquetá": ["Florencia", "San Vicente del Caguán"],
    "Casanare": ["Yopal", "Aguazul", "Villanueva"],
    "Cauca": ["Almaguer", "Argelia", "Balboa", "Bolívar", "Buenos Aires", "Cajibío", "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guachené", "Guapí", "Inzá", "Jambaló", "La Sierra", "La Vega", "López de Micay", "Mercaderes", "Miranda", "Morales", "Padilla", "Páez", "Patía", "Piamonte", "Piendamó", "Popayán", "Puerto Tejada", "Puracé", "Rosas", "San Sebastián", "Santa Rosa", "Santander de Quilichao", "Silvia", "Sotará", "Suárez", "Sucre", "Timbío", "Timbiquí", "Toribío", "Totoró", "Villa Rica"],
    "Cesar": ["Valledupar", "Aguachica", "Bosconia"],
    "Chocó": ["Quibdó", "Istmina", "Condoto"],
    "Córdoba": ["Montería", "Lorica", "Cereté", "Sahagún"],
    "Cundinamarca": ["Soacha", "Fusagasugá", "Zipaquirá", "Girardot", "Facatativá", "Chía"],
    "Guainía": ["Inírida"],
    "Guaviare": ["San José del Guaviare"],
    "Huila": ["Neiva", "Pitalito", "Garzón"],
    "La Guajira": ["Riohacha", "Maicao", "Fonseca", "San Juan del Cesar"],
    "Magdalena": ["Santa Marta", "Ciénaga", "Fundación"],
    "Meta": ["Villavicencio", "Acacías", "Granada"],
    "Nariño": ["Pasto", "Tumaco", "Ipiales"],
    "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona"],
    "Putumayo": ["Mocoa", "Puerto Asís", "Sibundoy"],
    "Quindío": ["Armenia", "Calarcá", "La Tebaida"],
    "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
    "San Andrés": ["San Andrés"],
    "Santander": ["Bucaramanga", "Floridablanca", "Giron", "Piedecuesta", "Barrancabermeja"],
    "Sucre": ["Sincelejo", "Corozal", "Sampués"],
    "Tolima": ["Ibagué", "Espinal", "Honda"],
    "Valle del Cauca": ["Alcalá", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Buenaventura", "Buga", "Bugalagrande", "Caicedonia", "Cali", "Calima (Darién)", "Candelaria", "Cartago", "Dagua", "El Águila", "El Cairo", "El Cerrito", "El Dovio", "Florida", "Ginebra", "Guacarí", "Jamundí", "La Cumbre", "La Unión", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo", "Riofrío", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo", "Tuluá", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"],
    "Vaupés": ["Carurú", "Mitú", "Taraira", "Pacoa", "Papunahua", "Yavaraté"],
    "Vichada": ["Puerto Carreño"]
};

// Evento al seleccionar un departamento
document.getElementById("departamento").addEventListener("change", function () {
    const departamentoSeleccionado = this.value;
    const ciudadSelect = document.getElementById("ciudad");

    // Limpiar opciones anteriores
    ciudadSelect.innerHTML = "";

    // Verifica si hay ciudades para el departamento
    if (ciudadesPorDepartamento[departamentoSeleccionado]) {
        ciudadesPorDepartamento[departamentoSeleccionado].forEach(ciudad => {
            const opcion = document.createElement("option");
            opcion.value = ciudad;
            opcion.textContent = ciudad;
            ciudadSelect.appendChild(opcion);
        });
    } else {
        // Opción por defecto
        const opcion = document.createElement("option");
        opcion.value = "";
        opcion.textContent = "Selecciona un departamento primero";
        ciudadSelect.appendChild(opcion);
    }
});

const numeroInput = document.getElementById('numero_billetera');
if (numeroInput) {
  numeroInput.addEventListener('input', () => {
    // Eliminar caracteres no numéricos
    numeroInput.value = numeroInput.value.replace(/\D/g, '');

    // Limitar a 10 dígitos
    if (numeroInput.value.length > 10) {
      numeroInput.value = numeroInput.value.slice(0, 10);
    }
  });
}

// 🔒 Restringir campos numéricos para que solo acepten números
const soloNumeros = ['numero_tarjeta', 'cvv', 'numero_billetera', 'documento', 'fecha_vencimiento'];

soloNumeros.forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('input', () => {
     if (id === 'fecha_vencimiento') {
  // Permitir solo números y una barra /
  input.value = input.value.replace(/[^0-9\/]/g, '');
} else {
  // Para los demás, solo números
  input.value = input.value.replace(/\D/g, '');
}
 // elimina todo lo que no sea dígito
    });
  }
});

// 🔒 Restringir campos a solo números (como teléfono)
const camposNumericos = ['checkout-telefono'];

camposNumericos.forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('input', () => {
      // Elimina todo lo que no sea número
      input.value = input.value.replace(/\D/g, '');

      // Limita a 10 caracteres
      if (input.value.length > 10) {
        input.value = input.value.slice(0, 10);
      }
    });
  }
});


// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initCheckout);