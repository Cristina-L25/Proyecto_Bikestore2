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






-- Luego vuelve a ejecutar el script de creación de la tabla.

SHOW COLUMNS FROM Productos;

SELECT * FROM Productos;

ALTER TABLE Productos 
MODIFY categoria ENUM(
    'bicicletas',
  'accesorios',
  'repuestos',
  'ropa_deportiva'
) NOT NULL;










SELECT * FROM Usuarios;
SELECT id, email, role FROM clientes WHERE email = 'admin@example.com';
SHOW COLUMNS FROM clientes;

SELECT id, role FROM Usuarios WHERE id = 1;

UPDATE Usuarios 
SET role = 'admin' 
WHERE id = 1 LIMIT 1;


UPDATE Usuarios
SET role = admin
WHERE id = 1;









-- Actualizar tabla pedidos para añadir info_contacto
ALTER TABLE pedidos ADD COLUMN info_contacto JSON;

-- Modificar detalle_pedidos para usar producto_nombre en lugar de producto_id
ALTER TABLE detalle_pedidos CHANGE COLUMN producto_id producto_nombre VARCHAR(255);

SELECT * FROM Usuarios;
SELECT id, email, role FROM clientes WHERE email = 'admin@example.com';
SHOW COLUMNS FROM pedidos;
SHOW COLUMNS FROM detalle_pedidos;
SHOW COLUMNS FROM ventas;

SELECT * FROM Productos;
SELECT * FROM pedidos;
SELECT * FROM detalle_pedidos;
SELECT * FROM ventas;

SELECT * FROM Carrito;
SELECT * FROM Favoritos;

SELECT * FROM Carrito WHERE usuario_id = 1;
SELECT * FROM Favoritos WHERE usuario_id = 1;

SELECT * FROM pedidos WHERE usuario_id = 1;




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






CREATE INDEX idx_producto_id ON detalle_pedidos(producto_id);


SELECT 
  TABLE_NAME, 
  COLUMN_NAME, 
  DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME IN ('pedidos', 'detalle_pedidos');

SELECT id FROM productos WHERE id IN (9, 10, 11);


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
  
DESCRIBE detalle_pedidos;

SELECT id, nombre FROM Productos WHERE id IN (9, 10, 11);

ALTER TABLE pedidos 
  MODIFY info_contacto JSON;

SELECT 
  v.id,
  v.pedido_id,
  DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i:%s') as fecha,
  v.monto_total as total,
  v.impuestos,
  v.monto_neto as neto,
  p.usuario_id,
  p.direccion_envio,
  p.metodo_pago,
  p.estado,
  u.nombre as nombre_usuario,
  u.email
FROM ventas v
INNER JOIN pedidos p ON v.pedido_id = p.id
INNER JOIN usuarios u ON p.usuario_id = u.id
ORDER BY v.fecha_venta DESC;


SELECT role FROM usuarios WHERE id = 5