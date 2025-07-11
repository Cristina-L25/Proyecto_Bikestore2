CREATE DATABASE bike_storeC;
USE bike_storeC;

-- Tabla de usuarios: registra la información de los clientes
CREATE TABLE Usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
contraseña VARCHAR(255) NOT NULL,
telefono VARCHAR(20),
direccion VARCHAR(255),
role VARCHAR(50) DEFAULT 'cliente',
fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM Usuarios;


ALTER TABLE Usuarios
ADD COLUMN reset_password_token VARCHAR(255),
ADD COLUMN reset_password_expires DATETIME;

DESCRIBE productos;

SELECT id, nombre FROM productos ORDER BY id;

CREATE TABLE Productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    categoria ENUM('bicicletas','accesorios','repuestos','ropa_deportiva') NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    disponibilidad ENUM('disponible', 'agotado', 'proxima-llegada') NOT NULL,
    descripcion TEXT,
    caracteristicas TEXT,
    imagen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE Productos
MODIFY COLUMN categoria ENUM('bicicletas','accesorios','repuestos','ropa_deportiva','ropa') NOT NULL;

ALTER TABLE Productos
MODIFY COLUMN categoria ENUM('bicicletas','accesorios','repuestos','ropa') NOT NULL;

SET SQL_SAFE_UPDATES = 1;


   UPDATE Productos
    SET categoria = 'ropa'
    WHERE categoria = 'ropa_deportiva';

 SET SQL_SAFE_UPDATES = 0;    

SELECT * FROM Productos;

ALTER TABLE Productos
ADD COLUMN marca VARCHAR(100) AFTER categoria,
ADD COLUMN stock INT DEFAULT 0 AFTER precio;


-- Tabla Carrito
CREATE TABLE Carrito (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
producto_id INT NOT NULL,
producto_nombre VARCHAR(255) NOT NULL,
producto_precio DECIMAL(10, 2) NOT NULL,
producto_imagen VARCHAR(255),
cantidad INT DEFAULT 1,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- Tabla Favoritos
CREATE TABLE Favoritos (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
producto_id INT NOT NULL,
producto_nombre VARCHAR(255) NOT NULL,
producto_precio DECIMAL(10, 2) NOT NULL,
producto_imagen VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);




-- Tabla de pedidos (información general del pedido)
CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'pendiente',
  direccion_envio VARCHAR(255) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  notas TEXT,
  info_contacto json,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

select * from pedidos; 

-- Tabla detalle_pedidos (productos individuales en cada pedido)
CREATE TABLE detalle_pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  producto_nombre VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla ventas (registro financiero de ventas completadas)
CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
  monto_total DECIMAL(10, 2) NOT NULL,
  comision_plataforma DECIMAL(10, 2) DEFAULT 0,
  impuestos DECIMAL(10, 2) DEFAULT 0,
  monto_neto DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

SELECT * FROM Usuarios;
UPDATE Usuarios 
SET role = 'admin' 
WHERE id = 1 LIMIT 1;



-- Nuevos Lanzamientos (IDs del 9 al 16)
INSERT INTO Productos (id, nombre, categoria, precio, stock, disponibilidad, imagen) VALUES
(9, 'Bicicleta Eléctrica Plus', 'bicicletas', 3500000, 5, 'disponible', 'Bicicleta Eléctrica Plus.jpg'),
(10, 'Kit de Reparación Integral', 'accesorios', 85000, 20, 'disponible', 'Kit de Reparación Integral.jpg'),
(11, 'Luces LED para Bicicleta', 'accesorios', 75000, 30, 'disponible', 'Luces LED para Bicicleta.jpg'),
(12, 'Cámara de Acción para Ciclismo', 'accesorios', 400000, 8, 'disponible', 'Cámara de Acción para Ciclismo.jpg'),
(13, 'Sillín Ergonómico', 'accesorios', 250000, 15, 'disponible', 'Sillín Ergonómico.jpg'),
(14, 'Guantes Pro para Ciclismo', 'ropa_deportiva', 150000, 25, 'disponible', 'Guantes Pro para Ciclismo.jpg'),
(15, 'Bicicleta Híbrida Nueva', 'bicicletas', 2900000, 7, 'disponible', 'Bicicleta Híbrida Nueva.jpg'),
(16, 'Cascos de Ciclismo de Alta Gama', 'accesorios', 500000, 10, 'disponible', 'Cascos de Ciclismo de Alta Gama.jpg');

-- Insertar productos principales (IDs 1-8)
INSERT INTO productos (id, nombre, precio, descripcion, imagen, categoria, stock, disponibilidad) VALUES 
(1, 'Bicicleta de Montaña X100', 2500000, 'Bicicleta de montaña de alta resistencia, perfecta para terrenos difíciles', 'img_produc_lanz/Bicicleta_de_Montaña_X100.png', 1, 15, 'disponible'),
(2, 'Bicicleta Urbana Z200', 1800000, 'Bicicleta urbana cómoda y práctica para el día a día en la ciudad', 'img_produc_lanz/Bicicleta_Urbana_Z200.png', 1, 20, 'disponible'),
(3, 'Casco de Bicicleta Pro', 350000, 'Casco de alta seguridad con certificación internacional', 'img_produc_lanz/Casco_de_Bicicleta_Pro.png', 2, 50, 'disponible'),
(4, 'Guantes de Ciclismo', 120000, 'Guantes acolchados con agarre antideslizante', 'img_produc_lanz/Guantes_de_Ciclismo.png', 2, 100, 'disponible'),
(5, 'Bicicleta de Carretera R300', 2200000, 'Bicicleta ligera diseñada para velocidad en carretera', 'img_produc_lanz/Bicicleta_de_Carretera_R300.png', 1, 10, 'disponible'),
(6, 'Bicicleta Eléctrica E-Bike', 3200000, 'Bicicleta eléctrica con batería de larga duración', 'img_produc_lanz/Bicicleta_Eléctrica_E-Bike.png', 1, 8, 'disponible'),
(7, 'Bicicleta Híbrida', 2800000, 'Combinación perfecta entre bicicleta de montaña y urbana', 'img_produc_lanz/Bicicleta_Híbrida.png', 1, 12, 'disponible'),
(8, 'Kit de Accesorios para Bicicleta', 450000, 'Kit completo con luces, timbre, portabotellas y herramientas básicas', 'img_produc_lanz/Kit_de_Accesorios_para_Bicicleta.png', 2, 30, 'disponible');




-- Productos principales (IDs 1-8)
INSERT INTO Productos
  (id, nombre, precio, descripcion, imagen, categoria, stock, disponibilidad)
VALUES
  (1, 'Bicicleta de Montaña X100', 2500000,
   'Bicicleta de montaña de alta resistencia, perfecta para terrenos difíciles',
   'Bicicleta_de_Montaña_X100.png', 'bicicletas', 15, 'disponible'),
  (2, 'Bicicleta Urbana Z200', 1800000,
   'Bicicleta urbana cómoda y práctica para el día a día en la ciudad',
   'Bicicleta_Urbana_Z200.png', 'bicicletas', 20, 'disponible'),
  (3, 'Casco de Bicicleta Pro', 350000,
   'Casco de alta seguridad con certificación internacional',
   'Casco_de_Bicicleta_Pro.png', 'accesorios', 50, 'disponible'),
  (4, 'Guantes de Ciclismo', 120000,
   'Guantes acolchados con agarre antideslizante',
   'Guantes_de_Ciclismo.png', 'accesorios', 100, 'disponible'),
  (5, 'Bicicleta de Carretera R300', 2200000,
   'Bicicleta ligera diseñada para velocidad en carretera',
   'Bicicleta_de_Carretera_R300.png', 'bicicletas', 10, 'disponible'),
  (6, 'Bicicleta Eléctrica E-Bike', 3200000,
   'Bicicleta eléctrica con batería de larga duración',
   'Bicicleta_Eléctrica_E-Bike.png', 'bicicletas', 8, 'disponible'),
  (7, 'Bicicleta Híbrida', 2800000,
   'Combinación perfecta entre bicicleta de montaña y urbana',
   'Bicicleta_Híbrida.png', 'bicicletas', 12, 'disponible'),
  (8, 'Kit de Accesorios para Bicicleta', 450000,
   'Kit completo con luces, timbre, portabotellas y herramientas básicas',
   'Kit_de_Accesorios_para_Bicicleta.png', 'accesorios', 30, 'disponible');

-- Nuevos lanzamientos (IDs 9-16)
INSERT INTO Productos
  (id, nombre, categoria, precio, stock, disponibilidad, imagen, descripcion)
VALUES
  (9,  'Bicicleta Eléctrica Plus',       'bicicletas',    3500000,  5,  'disponible',
   'Bicicleta Eléctrica Plus.jpg',
   'Bicicleta eléctrica de última generación con asistencia de pedaleo'),
  (10, 'Kit de Reparación Integral',     'accesorios',     85000,  20,  'disponible',
   'Kit de Reparación Integral.jpg',
   'Incluye herramientas y repuestos básicos para cualquier imprevisto'),
  (11, 'Luces LED para Bicicleta',       'accesorios',     75000,  30,  'disponible',
   'Luces LED para Bicicleta.jpg',
   'Juego de luces delanteras y traseras con múltiples modos de iluminación'),
  (12, 'Cámara de Acción para Ciclismo', 'accesorios',    400000,   8,  'disponible',
   'Cámara de Acción para Ciclismo.jpg',
   'Graba tus rutas en alta definición y con estabilizador de imagen'),
  (13, 'Sillín Ergonómico',              'accesorios',    250000,  15,  'disponible',
   'Sillín Ergonómico.jpg',
   'Diseño ergonómico para máximo confort en rutas largas'),
  (14, 'Guantes Pro para Ciclismo',      'ropa_deportiva',150000,  25,  'disponible',
   'Guantes Pro para Ciclismo.jpg',
   'Material transpirable y refuerzos antiabrasión'),
  (15, 'Bicicleta Híbrida Nueva',        'bicicletas',    2900000,  7,  'disponible',
   'Bicicleta Híbrida Nueva.jpg',
   'Modelo actualizado con cuadro ligero de aleación'),
  (16, 'Cascos de Ciclismo de Alta Gama','accesorios',    500000,  10,  'disponible',
   'Cascos de Ciclismo de Alta Gama.jpg',
   'Certificación CE y sistema de ventilación avanzado');



DELETE FROM Productos
WHERE id BETWEEN 1 AND 16;








-- actualiza_productos.sql

-- Productos principales (IDs 1–8)
UPDATE Productos
SET
  nombre        = 'Bicicleta de Montaña X100',
  marca         = 'Specialized',
  precio        = 2500000,
  descripcion   = 'Bicicleta de montaña de alta resistencia, perfecta para terrenos difíciles',
  caracteristicas = 'Cuadro de aluminio 6061, Suspensión delantera 120mm, Frenos de disco hidráulicos, Cambios Shimano 21 velocidades, Llantas 27.5", Peso 14.5kg',
  imagen        = 'Bicicleta_de_Montaña_X100.png',
  categoria     = 'bicicletas',
  stock         = 15,
  disponibilidad= 'disponible'
WHERE id = 1;

UPDATE Productos
SET
  nombre        = 'Bicicleta Urbana Z200',
  marca         = 'Giant',
  precio        = 1800000,
  descripcion   = 'Bicicleta urbana cómoda y práctica para el día a día en la ciudad',
  caracteristicas = 'Cuadro de acero, Transmisión de 7 velocidades, Frenos V-brake, Portaequipajes trasero, Guardabarros incluidos, Peso 16kg',
  imagen        = 'Bicicleta_Urbana_Z200.png',
  categoria     = 'bicicletas',
  stock         = 20,
  disponibilidad= 'disponible'
WHERE id = 2;

UPDATE Productos
SET
  nombre        = 'Casco de Bicicleta Pro',
  marca         = 'Specialized',
  precio        = 350000,
  descripcion   = 'Casco de alta seguridad con certificación internacional',
  caracteristicas = 'Certificación CE y CPSC, Sistema de ajuste dial-fit, 18 orificios de ventilación, Peso 280g, Tallas S/M/L/XL disponibles',
  imagen        = 'Casco_de_Bicicleta_Pro.png',
  categoria     = 'accesorios',
  stock         = 50,
  disponibilidad= 'disponible'
WHERE id = 3;

UPDATE Productos
SET
  nombre        = 'Guantes de Ciclismo',
  marca         = 'KSW Bikes',
  precio        = 120000,
  descripcion   = 'Guantes acolchados con agarre antideslizante',
  caracteristicas = 'Palma de silicona antideslizante, Acolchado de gel, Material transpirable, Cierre de velcro ajustable, Tallas S/M/L/XL',
  imagen        = 'Guantes_de_Ciclismo.png',
  categoria     = 'accesorios',
  stock         = 100,
  disponibilidad= 'disponible'
WHERE id = 4;

UPDATE Productos
SET
  nombre        = 'Bicicleta de Carretera R300',
  marca         = 'Cannondale',
  precio        = 2200000,
  descripcion   = 'Bicicleta ligera diseñada para velocidad en carretera',
  caracteristicas = 'Cuadro de fibra de carbono, Grupo Shimano 105, Frenos de disco, Llantas 700c, Peso 9.2kg, Geometría racing',
  imagen        = 'Bicicleta_de_Carretera_R300.png',
  categoria     = 'bicicletas',
  stock         = 10,
  disponibilidad= 'disponible'
WHERE id = 5;

UPDATE Productos
SET
  nombre        = 'Bicicleta Eléctrica E-Bike',
  marca         = 'Giant',
  precio        = 3200000,
  descripcion   = 'Bicicleta eléctrica con batería de larga duración',
  caracteristicas = 'Motor 250W, Batería 500Wh, Autonomía 80km, Pantalla LCD, Cargador incluido, Peso 22kg, Asistencia hasta 25km/h',
  imagen        = 'Bicicleta_Eléctrica_E-Bike.png',
  categoria     = 'bicicletas',
  stock         = 8,
  disponibilidad= 'disponible'
WHERE id = 6;

UPDATE Productos
SET
  nombre        = 'Bicicleta Híbrida',
  marca         = 'TYESO',
  precio        = 2800000,
  descripcion   = 'Combinación perfecta entre bicicleta de montaña y urbana',
  caracteristicas = 'Cuadro de aluminio, Suspensión delantera, Frenos de disco, Cambios 24 velocidades, Llantas 28", Peso 15.5kg',
  imagen        = 'Bicicleta_Híbrida.png',
  categoria     = 'bicicletas',
  stock         = 12,
  disponibilidad= 'disponible'
WHERE id = 7;

UPDATE Productos
SET
  nombre        = 'Kit de Accesorios para Bicicleta',
  marca         = 'KSW Bikes',
  precio        = 450000,
  descripcion   = 'Kit completo con luces, timbre, portabotellas y herramientas básicas',
  caracteristicas = 'Incluye: Luces LED, Timbre metálico, Portabotellas, Multiherramienta 16 funciones, Bomba portátil, Bolsa de herramientas',
  imagen        = 'Kit_de_Accesorios_para_Bicicleta.png',
  categoria     = 'accesorios',
  stock         = 30,
  disponibilidad= 'disponible'
WHERE id = 8;

-- Nuevos lanzamientos (IDs 9–16)
UPDATE Productos
SET
  nombre        = 'Bicicleta Eléctrica Plus',
  marca         = 'Specialized',
  precio        = 3500000,
  descripcion   = 'Bicicleta eléctrica de última generación con asistencia de pedaleo',
  caracteristicas = 'Motor Bosch 350W, Batería 625Wh, Autonomía 100km, Pantalla Kiox, Carga rápida 4h, Peso 23kg, Integración total',
  imagen        = 'Bicicleta Eléctrica Plus.jpg',
  categoria     = 'bicicletas',
  stock         = 5,
  disponibilidad= 'disponible'
WHERE id = 9;

UPDATE Productos
SET
  nombre        = 'Kit de Reparación Integral',
  marca         = 'TYESO',
  precio        = 85000,
  descripcion   = 'Incluye herramientas y repuestos básicos para cualquier imprevisto',
  caracteristicas = 'Desmontables, Parches, Pegamento, Llaves Allen, Destornilladores, Cable de freno, Eslabones de cadena, Estuche resistente',
  imagen        = 'Kit de Reparación Integral.jpg',
  categoria     = 'accesorios',
  stock         = 20,
  disponibilidad= 'disponible'
WHERE id = 10;

UPDATE Productos
SET
  nombre        = 'Luces LED para Bicicleta',
  marca         = 'Garmin',
  precio        = 75000,
  descripcion   = 'Juego de luces delanteras y traseras con múltiples modos de iluminación',
  caracteristicas = 'Luz delantera 400 lúmenes, Luz trasera 50 lúmenes, Batería recargable USB, 5 modos de iluminación, Resistente al agua IPX6',
  imagen        = 'Luces LED para Bicicleta.jpg',
  categoria     = 'accesorios',
  stock         = 30,
  disponibilidad= 'disponible'
WHERE id = 11;

UPDATE Productos
SET
  nombre        = 'Cámara de Acción para Ciclismo',
  marca         = 'Garmin',
  precio        = 400000,
  descripcion   = 'Graba tus rutas en alta definición y con estabilizador de imagen',
  caracteristicas = 'Resolución 4K, Estabilizador de imagen, Resistente al agua, Batería 2h, Memoria 64GB, Soporte para manillar incluido',
  imagen        = 'Cámara de Acción para Ciclismo.jpg',
  categoria     = 'accesorios',
  stock         = 8,
  disponibilidad= 'disponible'
WHERE id = 12;

UPDATE Productos
SET
  nombre        = 'Sillín Ergonómico',
  marca         = 'Specialized',
  precio        = 250000,
  descripcion   = 'Diseño ergonómico para máximo confort en rutas largas',
  caracteristicas = 'Cubierta de gel, Rieles de acero, Canal de alivio, Dimensiones 275x145mm, Peso 320g, Compatibilidad universal',
  imagen        = 'Sillín Ergonómico.jpg',
  categoria     = 'accesorios',
  stock         = 15,
  disponibilidad= 'disponible'
WHERE id = 13;

UPDATE Productos
SET
  nombre        = 'Guantes Pro para Ciclismo',
  marca         = 'Cannondale',
  precio        = 150000,
  descripcion   = 'Material transpirable y refuerzos antiabrasión',
  caracteristicas = 'Tejido transpirable, Refuerzos en palma, Acolchado dual-density, Cierre de velcro, Dedos táctiles, Tallas S/M/L/XL',
  imagen        = 'Guantes Pro para Ciclismo.jpg',
  categoria     = 'ropa',
  stock         = 25,
  disponibilidad= 'disponible'
WHERE id = 14;

UPDATE Productos
SET
  nombre        = 'Bicicleta Híbrida Nueva',
  marca         = 'Giant',
  precio        = 2900000,
  descripcion   = 'Modelo actualizado con cuadro ligero de aleación',
  caracteristicas = 'Cuadro de aleación premium, Suspensión delantera SR Suntour, Frenos de disco hidráulicos, Cambios 27 velocidades, Peso 14kg',
  imagen        = 'Bicicleta Híbrida Nueva.jpg',
  categoria     = 'bicicletas',
  stock         = 7,
  disponibilidad= 'disponible'
WHERE id = 15;

UPDATE Productos
SET
  nombre        = 'Cascos de Ciclismo de Alta Gama',
  marca         = 'Cannondale',
  precio        = 500000,
  descripcion   = 'Certificación CE y sistema de ventilación avanzado',
  caracteristicas = 'Certificación CE/CPSC/AS, 24 orificios de ventilación, Sistema MIPS, Peso 250g, Ajuste micro-dial, Visera desmontable',
  imagen        = 'Cascos de Ciclismo de Alta Gama.jpg',
  categoria     = 'accesorios',
  stock         = 10,
  disponibilidad= 'disponible'
WHERE id = 16;











-- Insertar en 'pedidos'
INSERT INTO pedidos (usuario_id, direccion_envio, metodo_pago, total, notas, info_contacto)
VALUES (
  1, 
  'calle papapa, cali, Antioquia', 
  'efectivo', 
  (3500000 + 85000 + 75000) + 12000 + ((3500000 + 85000 + 75000) * 0.19), 
  'el peor producto', 
  '{"nombre": "ewe", "email": "cristina333@gmail.com", "telefono": "3150040333"}'
);

-- Luego insertar en 'detalle_pedidos' (usando el ID del pedido generado)
INSERT INTO detalle_pedidos (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal)
VALUES 
  (LAST_INSERT_ID(), 9, (SELECT nombre FROM Productos WHERE id = 9), 1, 3500000, 3500000),
  (LAST_INSERT_ID(), 10, (SELECT nombre FROM Productos WHERE id = 10), 1, 85000, 85000),
  (LAST_INSERT_ID(), 11, (SELECT nombre FROM Productos WHERE id = 11), 1, 75000, 75000);
  
  SELECT * FROM pedidos;
  SELECT * FROM detalle_pedidos;
  SELECT * FROM Carrito where id= 1;
  
SELECT *
FROM pedidos
WHERE usuario_id = 1;
  