import { apiRequest } from './api.js';
import { mostrarMensaje } from './ui.js';
import { actualizarContadorCarrito } from './cart.js';

export function initCheckout() {
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
}


// Mapeo completo de ciudades por departamento en Colombia
const ciudadesPorDepartamento = {
    "Amazonas": ["Leticia", "Puerto Nariño", "La Chorrera", "La Pedrera", "La Victoria", "Miriti - Paraná", "Puerto Alegría", "Puerto Arica", "Puerto Santander", "Tarapacá", "El Encanto"],
    "Antioquia": ["Abejorral","Abriaquí","Alejandría","Amagá","Amalfi","Andes","Angelópolis","Angostura","Anorí","Anzá","Apartadó","Arboletes","Argelia","Armenia","Barbosa","Bello","Belmira","Betania","Betulia","Ciudad Bolívar","Briceño","Buriticá","Cáceres","Caicedo","Caldas","Campamento","Cañasgordas","Caracolí","Caramanta","Carepa","Carmen de Viboral","Carolina del Príncipe","Caucasia","Chigorodó","Cisneros","Cocorná","Concepción","Concordia","Copacabana","Dabeiba","Don Matías","Ebéjico","El Bagre","El Carmen de Viboral","El Peñol","El Retiro","El Santuario","Entrerríos","Envigado","Fredonia","Frontino","Giraldo","Girardota","Gómez Plata","Granada","Guadalupe","Guarne","Guatapé","Heliconia","Hispania","Itagüí","Ituango","Jardín","Jericó","La Ceja","La Estrella","La Pintada","La Unión","Liborina","Maceo","Marinilla","Medellín","Montebello","Murindó","Mutatá","Nariño","Nechí","Necoclí","Olaya","Peñol","Peque","Pueblorrico","Puerto Berrío","Puerto Nare","Puerto Triunfo","Remedios","Retiro","Rionegro","Sabanalarga","Sabaneta","Salgar","San Andrés de Cuerquia","San Carlos","San Francisco","San Jerónimo","San José de la Montaña","San Juan de Urabá","San Luis","San Pedro de los Milagros","San Pedro de Urabá","San Rafael","San Roque","San Vicente","Santa Bárbara","Santa Fe de Antioquia","Santa Rosa de Osos","Santo Domingo","Segovia","Sonsón","Sopetrán","Támesis","Tarazá","Tarso","Titiribí","Toledo","Turbo","Uramita","Urrao","Valdivia","Valparaíso","Vegachí","Venecia","Vigía del Fuerte","Yalí","Yarumal","Yolombó","Yondó","Zaragoza"],
    "Arauca": ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón", "Saravena", "Tame"],
    "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia", "Sabanalarga"],
    "Atlántico": ["Baranoa","Barranquilla","Campo de la Cruz","Candelaria","Galapa","Juan de Acosta","Luruaco","Malambo","Manatí","Palmar de Varela","Piojó","Polonuevo","Ponedera","Puerto Colombia","Repelón","Sabanagrande","Sabanalarga","Santa Lucía","Santo Tomás","Soledad","Suán","Tubará","Usiacurí"],
    "Bogotá D.C.": ["Bogotá D.C"],
    "Bolívar": ["Achí","Altos del Rosario","Arenal","Arjona","Arroyohondo","Barranco de Loba","Brazuelo de Papayal","Calamar","Cantagallo","Cartagena","Cicuco","Clemencia","Córdoba","El Carmen de Bolívar","El Guamo","El Peñón","Hatillo de Loba","Magangué","Mahates","Margarita","María la Baja","Montecristo","Mompós","Morales","Norosí","Pinillos","Regidor","Río Viejo","San Cristóbal","San Estanislao","San Fernando","San Jacinto","San Jacinto del Cauca","San Juan Nepomuceno","San Martín de Loba","San Pablo","Santa Catalina","Santa Rosa","Santa Rosa del Sur","Simití","Soplaviento","Talaigua Nuevo","Tiquisio","Turbaco","Turbana","Villanueva","Zambrano"],
    "Boyacá": ["Almeida","Aquitania","Arcabuco","Belén","Berbeo","Betéitiva","Boavita","Boyacá","Briceño","Buena Vista","Busbanzá","Caldas","Campohermoso","Cerinza","Chinavita","Chiquinquirá","Chiscas","Chita","Chitaraque","Chivatá","Chíquiza","Chivor","Ciénega","Cómbita","Coper","Corrales","Covarachía","Cubará","Cucaita","Cuítiva","Duitama","El Cocuy","El Espino","Firavitoba","Floresta","Gachantivá","Gameza","Garagoa","Guacamayas","Guateque","Guayatá","Güicán","Iza","Jenesano","Jericó","La Capilla","La Uvita","La Victoria","Labranzagrande","Macanal","Maripí","Miraflores","Mongua","Monguí","Moniquirá","Motavita","Muzo","Nobsa","Nuevo Colón","Oicatá","Otanche","Pachavita","Páez","Paipa","Pajarito","Panqueba","Pauna","Paya","Paz de Río","Pesca","Pisba","Puerto Boyacá","Quípama","Ramiriquí","Ráquira","Rondón","Saboyá","Sáchica","Samacá","San Eduardo","San José de Pare","San Luis de Gaceno","San Mateo","San Miguel de Sema","San Pablo de Borbur","Santa María","Santa Rosa de Viterbo","Santa Sofía","Santana","Sativanorte","Sativasur","Siachoque","Soatá","Socha","Socotá","Sogamoso","Somondoco","Sora","Soracá","Sotaquirá","Susacón","Sutamarchán","Sutatenza","Tasco","Tenza","Tibaná","Tibasosa","Tinjacá","Tipacoque","Toca","Togüí","Tópaga","Tota","Tunja","Tununguá","Turmequé","Tuta","Tutazá","Úmbita","Ventaquemada","Viracachá","Zetaquira"],
    "Caldas": ["Aguadas","Anserma","Aranzazu","Belalcázar","Chinchiná","Filadelfia","La Dorada","La Merced","Manizales","Manzanares","Marmato","Marquetalia","Marulanda","Neira","Norcasia","Pácora","Palestina","Pensilvania","Riosucio","Risaralda","Salamina","Samaná","San José","Supía","Victoria","Villamaría","Viterbo"],
    "Caquetá": ["Albania","Belén de los Andaquíes","Cartagena del Chairá","Curillo","El Doncello","El Paujil","Florencia","La Montañita","Milán","Morelia","Puerto Milán","Puerto Rico","San José del Fragua","San Vicente del Caguán","Solano","Solita","Valparaíso"],
    "Casanare": ["Aguazul","Chámeza","Hato Corozal","La Salina","Maní","Monterrey","Nunchía","Orocué","Paz de Ariporo","Pore","Recetor","Sabanalarga","Sácama","San Luis de Palenque","Támara","Tauramena","Trinidad","Villanueva","Yopal"],
    "Cauca": ["Almaguer","Argelia","Balboa","Bolívar","Buenos Aires","Cajibío","Caldono","Caloto","Corinto","El Tambo","Florencia","Guachené","Guapí","Inzá","Jambaló","La Sierra","La Vega","López de Micay","Mercaderes","Miranda","Morales","Padilla","Páez","Patía","Piamonte","Piendamó","Popayán","Puerto Tejada","Puracé","Rosas","San Sebastián","Santa Rosa","Santander de Quilichao","Silvia","Sotará","Suárez","Sucre","Timbío","Timbiquí","Toribío","Totoró","Villa Rica"],
    "Cesar": ["Aguachica","Agustín Codazzi","Astrea","Becerril","Bosconia","Chimichagua","Chiriguaná","Curumaní","El Copey","El Paso","Gamarra","González","La Gloria","La Jagua de Ibirico","La Paz","Manaure Balcón del Cesar","Pailitas","Pelaya","Pueblo Bello","Río de Oro","San Alberto","San Diego","San Martín","Tamalameque","Valledupar"],
    "Chocó": ["Acandí","Alto Baudó","Bagadó","Bahía Solano","Bajo Baudó","Bojayá","Cértegui","Condoto","El Atrato","El Cantón del San Pablo","El Carmen de Atrato","El Carmen del Darién","Istmina","Juradó","Lloró","Medio Atrato","Medio Baudó","Medio San Juan","Nóvita","Nuquí","Quibdó","Río Iró","Río Quito","Riosucio","San José del Palmar","Sipí","Tadó","Unguía","Unión Panamericana"],
    "Córdoba": ["Ayapel","Buenavista","Canalete","Cereté","Chimá","Chinú","Ciénaga de Oro","Cotorra","La Apartada","Lorica","Los Córdobas","Momil","Montelíbano","Montería","Moñitos","Planeta Rica","Pueblo Nuevo","Puerto Escondido","Puerto Libertador","Purísima","Sahagún","San Andrés de Sotavento","San Antero","San Bernardo del Viento","San Carlos","San José de Uré","San Pelayo","Tierralta","Tuchín","Valencia"],
    "Cundinamarca": ["Agua de Dios","Albán","Anapoima","Anolaima","Apulo","Arbeláez","Beltrán","Bituima","Bojacá","Cabrera","Cachipay","Cajicá","Caparrapí","Cáqueza","Carmen de Carupa","Chaguaní","Chía","Chipaque","Choachí","Chocontá","Cogua","Cota","Cucunubá","El Colegio","El Peñón","El Rosal","Facatativá","Fómeque","Fosca","Funza","Fúquene","Fusagasugá","Gachalá","Gachancipá","Gachetá","Gama","Girardot","Granada","Guachetá","Guaduas","Guasca","Guataquí","Guatavita","Guayabal de Síquima","Guayabetal","Gutiérrez","Jerusalén","Junín","La Calera","La Mesa","La Palma","La Peña","La Vega","Lenguazaque","Macheta","Madrid","Manta","Medina","Mosquera","Nariño","Nemocón","Nilo","Nimaima","Nocaima","Pacho","Paime","Pandi","Paratebueno","Pasca","Puerto Salgar","Pulí","Quebradanegra","Quetame","Quipile","Ricaurte","San Antonio del Tequendama","San Bernardo","San Cayetano","San Francisco","San Juan de Rioseco","Sasaima","Sesquilé","Sibaté","Silvania","Simijaca","Soacha","Sopó","Subachoque","Suesca","Supatá","Susa","Sutatausa","Tabio","Tausa","Tena","Tenjo","Tibacuy","Tibirita","Tocaima","Tocancipá","Topaipí","Ubalá","Ubaque","Ubaté","Une","Útica","Venecia","Vergara","Vianí","Villagómez","Villapinzón","Villeta","Viotá","Yacopí","Zipacón","Zipaquirá"],
    "Guainía": ["Barranco Minas","Cacahual","Inírida","La Guadalupe","Mapiripana","Morichal","Pana Pana","Puerto Colombia","San Felipe"],
    "Guaviare": ["Calamar","El Retorno","Miraflores","San José del Guaviare"],
    "Huila": ["Acevedo","Agrado","Aipe","Algeciras","Altamira","Baraya","Campoalegre","Colombia","Elías","Garzón","Gigante","Guadalupe","Hobo","Iquira","Isnos","La Argentina","La Plata","Nátaga","Neiva","Oporapa","Paicol","Palermo","Palestina","Pital","Pitalito","Rivera","Saladoblanco","San Agustín","Santa María","Suaza","Tarqui","Tello","Teruel","Tesalia","Timaná","Villavieja","Yaguará"],
    "La Guajira": ["Albania","Barrancas","Dibulla","Distracción","El Molino","Fonseca","Hatonuevo","La Jagua del Pilar","Maicao","Manaure","Riohacha","San Juan del Cesar","Uribia","Urumita","Villanueva"],
    "Magdalena": ["Algarrobo","Aracataca","Ariguaní","Cerro de San Antonio","Chibolo","Ciénaga","Concordia","El Banco","El Piñón","El Retén","Fundación","Guamal","Nueva Granada","Pedraza","Pivijay","Plato","Puebloviejo","Remolino","Sabanas de San Ángel","Salamina","San Sebastián de Buenavista","San Zenón","Santa Ana","Santa Bárbara de Pinto","Santa Marta","Sitionuevo","Tenerife","Zapayán","Zona Bananera"],
    "Meta": ["Acacías","Barranca de Upía","Cabuyaro","Castilla la Nueva","Cubarral","Cumaral","El Calvario","El Castillo","El Dorado","Fuente de Oro","Granada","Guamal","La Macarena","Lejanías","Mapiripán","Mesetas","Puerto Concordia","Puerto Gaitán","Puerto Lleras","Puerto López","Puerto Rico","Restrepo","San Carlos de Guaroa","San Juan de Arama","San Juanito","San Martín","Uribe","Villavicencio","Vista Hermosa"],
    "Nariño": ["Aldana","Ancuya","Arboleda","Barbacoas","Belén","Buesaco","Chachagüí","Colón","Consacá","Contadero","Córdoba","Cuaspud","Cumbal","Cumbitara","El Charco","El Peñol","El Rosario","El Tablón","El Tambo","Francisco Pizarro","Funes","Guachucal","Guaitarilla","Gualmatán","Iles","Imués","Ipiales","La Cruz","La Florida","La Llanada","La Tola","La Unión","Leiva","Linares","Los Andes","Magüí","Mallama","Mosquera","Nariño","Olaya Herrera","Ospina","Pasto","Policarpa","Potosí","Providencia","Puerres","Pupiales","Ricaurte","Roberto Payán","Samaniego","San Andrés de Tumaco","San Bernardo","San Lorenzo","San Pablo","San Pedro de Cartago","Sandoná","Santa Bárbara","Santacruz","Sapuyes","Taminango","Tangua","Túquerres","Yacuanquer"],
    "Norte de Santander": ["Abrego","Arboledas","Bochalema","Bucarasica","Cáchira","Cácota","Chinácota","Chitagá","Convención","Cúcuta","Cucutilla","Durania","El Carmen","El Tarra","El Zulia","Gramalote","Hacarí","Herrán","La Esperanza","La Playa","Labateca","Los Patios","Lourdes","Mutiscua","Ocaña","Pamplona","Pamplonita","Puerto Santander","Ragonvalia","Salazar","San Calixto","San Cayetano","Santiago","Sardinata","Silos","Teorama","Tibú","Toledo","Villa Caro","Villa del Rosario"],
    "Putumayo": ["Colón","Leguízamo","Mocoa","Orito","Puerto Asís","Puerto Caicedo","Puerto Guzmán","Puerto Leguízamo","San Francisco","San Miguel","Santiago","Sibundoy","Valle del Guamuez","Villagarzón"],
    "Quindío": ["Armenia","Buenavista","Calarcá","Circasia","Córdoba","Filandia","Génova","La Tebaida","Montenegro","Pijao","Quimbaya","Salento"],
    "Risaralda": ["Apía","Balboa","Belén de Umbría","Dosquebradas","Guática","La Celia","La Virginia","Marsella","Mistrató","Pereira","Pueblo Rico","Quinchía","Santa Rosa de Cabal","Santuario"],
    "San Andrés": ["Providencia","San Andrés"],
    "Santander": ["Aguada","Albania","Aratoca","Barbosa","Barichara","Barrancabermeja","Betulia","Bolívar","Bucaramanga","Cabrera","California","Capitanejo","Carcasí","Cepitá","Cerrito","Charalá","Charta","Chima","Chipatá","Cimitarra","Concepción","Confines","Contratación","Coromoro","Curití","El Carmen de Chucurí","El Guacamayo","El Peñón","El Playón","Encino","Enciso","Florián","Floridablanca","Galán","Gambita","Girón","Guaca","Guadalupe","Guapotá","Guavatá","Güepsa","Hato","Jesús María","Jordán","La Belleza","La Paz","Landázuri","Lebríja","Los Santos","Macaravita","Malaga","Matanza","Mogotes","Molagavita","Ocamonte","Oiba","Onzaga","Palmar","Palmas del Socorro","Páramo","Piedecuesta","Pinchote","Puente Nacional","Puerto Parra","Puerto Wilches","Rionegro","Sabana de Torres","San Andrés","San Benito","San Gil","San Joaquín","San José de Miranda","San Miguel","Santa Bárbara","Santa Helena del Opón","Simacota","Socorro","Suaita","Sucre","Suratá","Tona","Valle de San José","Vélez","Vetas","Villanueva","Zapatoca"],
    "Sucre": ["Buenavista","Caimito","Chalán","Colosó","Corozal","Coveñas","El Roble","Galeras","Guaranda","La Unión","Los Palmitos","Majagual","Morroa","Ovejas","Palmito","Sampués","San Benito Abad","San Juan de Betulia","San Marcos","San Onofre","San Pedro","Sincé","Sincelejo","Sucre","Tolú","Tolú Viejo"],
    "Tolima": ["Alpujarra","Alvarado","Ambalema","Anzoátegui","Armero","Ataco","Cajamarca","Carmen de Apicalá","Casabianca","Chaparral","Coello","Coyaima","Cunday","Dolores","Espinal","Falan","Flandes","Fresno","Guamo","Herveo","Honda","Ibagué","Icononzo","Lérida","Líbano","Mariquita","Melgar","Murillo","Natagaima","Ortega","Palocabildo","Piedras","Planadas","Prado","Purificación","Rioblanco","Roncesvalles","Rovira","Saldaña","San Antonio","San Luis","Santa Isabel","Suárez","Valle de San Juan","Venadillo","Villahermosa","Villarrica"],
    "Valle del Cauca": ["Alcalá", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Buenaventura", "Buga", "Bugalagrande", "Caicedonia", "Cali", "Calima (Darién)", "Candelaria", "Cartago", "Dagua", "El Águila", "El Cairo", "El Cerrito", "El Dovio", "Florida", "Ginebra", "Guacarí", "Jamundí", "La Cumbre", "La Unión", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo", "Riofrío", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo", "Tuluá", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"],
    "Vaupés": ["Carurú","Mitú","Taraira","Pacoa","Papunahua","Yavaraté"],
    "Vichada": ["Cumaribo","La Primavera","Puerto Carreño","Santa Rosalía"],

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

// Mostrar el modal
function mostrarModalConfirmacion() {
  const modal = document.getElementById('confirmation-modal');
  modal.style.display = 'block';
}

// Cerrar el modal al hacer clic en la X
document.querySelector('.checkout-modal-close').addEventListener('click', function () {
  document.getElementById('confirmation-modal').style.display = 'none';
});

// Cerrar al hacer clic fuera del contenido
window.addEventListener('click', function (event) {
  const modal = document.getElementById('confirmation-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initCheckout);