
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS autolavado_db;
USE autolavado_db;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Empleados
CREATE TABLE IF NOT EXISTS Empleados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'empleado') NOT NULL DEFAULT 'empleado',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Vehículos
CREATE TABLE IF NOT EXISTS Vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  anio INT,
  color VARCHAR(50),
  placa VARCHAR(20) NOT NULL,
  tipo ENUM('Sedan', 'SUV', 'Pickup', 'Camioneta', 'Motocicleta', 'Otro') NOT NULL DEFAULT 'Sedan',
  usuarioId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES Usuarios(id) ON DELETE SET NULL
);

-- Tabla de Servicios
CREATE TABLE IF NOT EXISTS Servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  duracionEstimada INT,
  activo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Órdenes
CREATE TABLE IF NOT EXISTS Ordenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('Pendiente', 'En Proceso', 'Completado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
  observaciones TEXT,
  nombreCliente VARCHAR(100),
  telefonoCliente VARCHAR(20),
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  usuarioId INT,
  vehiculoId INT NOT NULL,
  empleadoId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES Usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (vehiculoId) REFERENCES Vehiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (empleadoId) REFERENCES Empleados(id) ON DELETE SET NULL
);

-- Tabla intermedia para la relación muchos a muchos entre Orden y Servicio
CREATE TABLE IF NOT EXISTS OrdenServicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  OrdenId INT NOT NULL,
  ServicioId INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precioUnitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (OrdenId) REFERENCES Ordenes(id) ON DELETE CASCADE,
  FOREIGN KEY (ServicioId) REFERENCES Servicios(id) ON DELETE CASCADE
);

-- Insertar servicios de ejemplo
INSERT INTO Servicios (nombre, descripcion, precio, duracionEstimada, activo) VALUES
('Lavado Básico', 'Incluye lavado exterior, secado y aspirado básico del interior.', 150.00, 30, TRUE),
('Lavado Completo', 'Incluye lavado exterior, encerado, aspirado completo y limpieza de interiores.', 250.00, 60, TRUE),
('Lavado Premium', 'Incluye todo el servicio completo más pulido, tratamiento de cuero y aromatización.', 350.00, 90, TRUE),
('Encerado', 'Aplicación de cera para protección y brillo.', 100.00, 30, TRUE),
('Pulido', 'Pulido de carrocería para eliminar rayones superficiales.', 200.00, 60, TRUE),
('Lavado de Motor', 'Limpieza del compartimiento del motor.', 150.00, 45, TRUE);

-- Insertar un usuario administrador por defecto
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO Empleados (nombre, apellido, email, telefono, password, rol) VALUES
('Admin', 'Sistema', 'admin@autolavado.com', '1234567890', 'admin123', 'admin');
