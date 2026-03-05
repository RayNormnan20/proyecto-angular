-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS gestion_empresarial;
USE gestion_empresarial;

-- Tabla de Roles
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Permisos
CREATE TABLE permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Intermedia Roles-Permisos
CREATE TABLE roles_permisos (
    rol_id INT,
    permiso_id INT,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id_permiso) ON DELETE CASCADE
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT,
    estado ENUM('activo', 'suspendido', 'inactivo') DEFAULT 'activo',
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id_rol) ON DELETE SET NULL
);

-- Tabla de Sesiones (para Refresh Tokens)
CREATE TABLE sesiones (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    refresh_token VARCHAR(512) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de Logs de Acceso
CREATE TABLE logs_acceso (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, FAILED_LOGIN
    ip_address VARCHAR(45),
    detalles TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- Insertar roles iniciales
INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador del sistema con acceso total'),
('supervisor', 'Supervisor con acceso a gestión y reportes'),
('trabajador', 'Usuario estándar con acceso limitado');

-- Insertar permisos básicos
INSERT INTO permisos (nombre, descripcion) VALUES
('ver_dashboard', 'Acceso al dashboard principal'),
('gestionar_usuarios', 'Crear, editar y eliminar usuarios'),
('ver_reportes', 'Ver reportes del sistema');

-- Asignar permisos al rol admin
INSERT INTO roles_permisos (rol_id, permiso_id) 
SELECT r.id_rol, p.id_permiso FROM roles r, permisos p 
WHERE r.nombre = 'admin';

-- Usuario Admin por defecto (Password: Admin123!)
-- Hash generado con bcrypt (cost 10) para 'Admin123!'
INSERT INTO usuarios (nombre, email, password_hash, rol_id, estado) VALUES 
('Administrador', 'admin@empresa.com', '$2b$10$VL9tAH1p0bAfpVsqr5XRDOEdYmyOZ3E62I28gEwOqq1cw9qx0LGyq', 1, 'activo');
