-- Script Completo de Base de Datos para Gestión Empresarial
-- Generado para: josepintadoyamo@gmail.com
-- Base de Datos: sistemagaby

SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas existentes para asegurar que el esquema se aplique correctamente
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS sesiones;
DROP TABLE IF EXISTS logs_acceso;
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS detalle_ordenes;
DROP TABLE IF EXISTS ordenes;
DROP TABLE IF EXISTS producto_imagenes;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permisos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS marcas;
DROP TABLE IF EXISTS metodos_pago;
DROP TABLE IF EXISTS configuraciones;
DROP TABLE IF EXISTS email_logs;
DROP TABLE IF EXISTS testimonios;
DROP TABLE IF EXISTS home_banners;

SET FOREIGN_KEY_CHECKS = 1;

CREATE DATABASE IF NOT EXISTS sistemagaby;
USE sistemagaby;

-- 1. Tabla de Roles
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla de Permisos
CREATE TABLE permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabla Intermedia Role-Permissions
CREATE TABLE role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permisos(id_permiso) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla de Usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT,
    estado ENUM('activo', 'suspendido', 'inactivo') DEFAULT 'activo',
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id_rol) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Tabla de Sesiones (Refresh Tokens)
CREATE TABLE sesiones (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    refresh_token TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabla de Logs de Acceso
CREATE TABLE logs_acceso (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, FAILED_LOGIN
    ip_address VARCHAR(45),
    detalles TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Tabla de Categorías
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    imagen VARCHAR(255),
    descripcion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Tabla de Marcas
CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 9. Tabla de Productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    codigo_sku VARCHAR(100) UNIQUE,
    estado ENUM('activo', 'inactivo', 'agotado') DEFAULT 'activo',
    visible_web BOOLEAN DEFAULT TRUE,
    categoria_id INT,
    marca_id INT,
    precios_volumen JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria) ON DELETE SET NULL,
    FOREIGN KEY (marca_id) REFERENCES marcas(id_marca) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10. Tabla de Imágenes de Productos
CREATE TABLE producto_imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Tabla de Métodos de Pago
CREATE TABLE metodos_pago (
    id_metodo_pago INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    instrucciones TEXT,
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    requiere_comprobante BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 12. Tabla de Ordenes
CREATE TABLE ordenes (
    id_orden INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estado ENUM('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    metodo_pago_id INT,
    codigo_operacion VARCHAR(100),
    comprobante_pago VARCHAR(255),
    direccion_envio VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id_metodo_pago) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Tabla de Detalle de Ordenes
CREATE TABLE detalle_ordenes (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id_orden) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Tabla de Configuraciones
CREATE TABLE configuraciones (
    id_config INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 15. Tabla de Favoritos
CREATE TABLE favoritos (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_fav (usuario_id, producto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. Tabla de Logs de Email
CREATE TABLE email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destinatario VARCHAR(255) NOT NULL,
    asunto VARCHAR(255) NOT NULL,
    contenido TEXT,
    estado ENUM('enviado', 'fallido') DEFAULT 'enviado',
    error_mensaje TEXT,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo ENUM('orden', 'bienvenida', 'test', 'otro') DEFAULT 'otro',
    referencia_id INT
) ENGINE=InnoDB;

-- 17. Tabla de Testimonios
CREATE TABLE testimonios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensaje TEXT,
    imagen_url VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 18. Tabla de Banners del Home (Carousel/Marcas/Ofertas)
CREATE TABLE home_banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placement VARCHAR(50) NOT NULL, -- carousel, marcas, ofertas
    title VARCHAR(100),
    description TEXT,
    button_text VARCHAR(50),
    button_link VARCHAR(255),
    image_url VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- DATA INICIAL (Roles, Permisos, Config, Admin)
-- ==========================================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador total del sistema'),
('supervisor', 'Gestión de operaciones y reportes'),
('trabajador', 'Gestión de pedidos y productos'),
('usuario', 'Cliente final');

-- Permisos
INSERT INTO permisos (nombre, descripcion) VALUES
('VER_USUARIOS', 'Ver lista de usuarios'),
('CREAR_USUARIO', 'Crear usuarios'),
('EDITAR_USUARIO', 'Editar usuarios'),
('ELIMINAR_USUARIO', 'Eliminar usuarios'),
('VER_ROLES', 'Ver lista de roles'),
('CREAR_ROL', 'Crear roles'),
('EDITAR_ROL', 'Editar roles'),
('ELIMINAR_ROL', 'Eliminar roles'),
('VER_PRODUCTOS', 'Ver lista de productos'),
('CREAR_PRODUCTO', 'Crear productos'),
('EDITAR_PRODUCTO', 'Editar productos'),
('ELIMINAR_PRODUCTO', 'Eliminar productos'),
('VER_CATEGORIAS', 'Ver lista de categorías'),
('CREAR_CATEGORIA', 'Crear categorías'),
('EDITAR_CATEGORIA', 'Editar categorías'),
('ELIMINAR_CATEGORIA', 'Eliminar categorías'),
('VER_MARCAS', 'Ver lista de marcas'),
('CREAR_MARCA', 'Crear marcas'),
('EDITAR_MARCA', 'Editar marcas'),
('ELIMINAR_MARCA', 'Eliminar marcas'),
('VER_PEDIDOS', 'Ver lista de pedidos'),
('GESTIONAR_PEDIDOS', 'Cambiar estado de pedidos'),
('VER_CONFIGURACION', 'Ver configuración del sistema'),
('GESTIONAR_CONFIGURACION', 'Modificar configuración'),
('VER_TESTIMONIOS', 'Ver testimonios'),
('GESTIONAR_TESTIMONIOS', 'Aprobar/Editar testimonios'),
('ELIMINAR_TESTIMONIO', 'Eliminar testimonios'),
('VER_LOGS_EMAIL', 'Ver historial de correos'),
('VER_METODOS_PAGO', 'Ver métodos de pago'),
('GESTIONAR_METODOS_PAGO', 'Editar métodos de pago'),
('ELIMINAR_METODO_PAGO', 'Eliminar métodos de pago'),
('GESTIONAR_BANNERS_HOME', 'Gestionar imágenes del home'),
('ELIMINAR_BANNER_HOME', 'Eliminar imágenes del home'),
('VER_DASHBOARD', 'Ver panel de estadísticas');

-- Asignar todos los permisos al rol Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id_rol, p.id_permiso FROM roles r CROSS JOIN permisos p WHERE r.nombre = 'admin';

-- Configuración Inicial
INSERT INTO configuraciones (clave, valor, descripcion) VALUES 
('yape_qr', '', 'QR de Yape'),
('yape_nombre', 'Jose Pintado Yamo', 'Nombre titular Yape'),
('transfer_banco', 'BCP', 'Banco para transferencias'),
('transfer_numero', '191-00000000-0-00', 'Número de cuenta'),
('transfer_cci', '002-191-00000000000-00', 'CCI'),
('transfer_titular', 'Jose Pintado Yamo', 'Titular de cuenta');

-- Usuario Administrador Inicial (Password: 1234567)
INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol_id, estado) VALUES 
('Jose', 'Pintado Yamo', 'josepintadoyamo@gmail.com', '$2b$10$K03sTezE9y83q6Shz8JJHug7GWFw9LGFl5tF2o9L7BtTE8MRb1QjO', 
(SELECT id_rol FROM roles WHERE nombre = 'admin'), 'activo');
