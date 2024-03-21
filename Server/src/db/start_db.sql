-- Archivo de reacion inicial de la Base de Datos

DROP DATABASE IF EXISTS digital_signage_db;

-- Creamos la BD
CREATE DATABASE IF NOT EXISTS digital_signage_db;

USE digital_signage_db;

-- Creamos las tablas
CREATE TABLE IF NOT EXISTS taquillas_ETN (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    dispositivo VARCHAR(50) NOT NULL,
    proyeccion VARCHAR(50) NOT NULL,
    estatus VARCHAR(50) NOT NULL
    
);

CREATE TABLE IF NOT EXISTS taquillas_GHO (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    dispositivo VARCHAR(50) NOT NULL,
    proyeccion VARCHAR(50) NOT NULL,
    estatus VARCHAR(50) NOT NULL
    
);

CREATE TABLE IF NOT EXISTS taquillas_COSTA (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    dispositivo VARCHAR(50) NOT NULL,
    proyeccion VARCHAR(50) NOT NULL,
    estatus VARCHAR(50) NOT NULL
    
);

CREATE TABLE IF NOT EXISTS campañas_ETN (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    fecha_inicio VARCHAR(15),
    fecha_fin VARCHAR(15),
    estatus VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS campañas_GHO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    fecha_inicio VARCHAR(15),
    fecha_fin VARCHAR(15),
    estatus VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS campañas_COSTA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    fecha_inicio VARCHAR(15),
    fecha_fin VARCHAR(15),
    estatus VARCHAR(50)
);

CREATE TABLE taquillas_campañas_ETN(
	taquilla_id INT REFERENCES taquillas_ETN(id),
    campaña_id INT REFERENCES campañas_ETN(id),
    estatus_individual VARCHAR(50),
    PRIMARY KEY (taquilla_id, campaña_id)
);

-- Ejemplo de Consulta de campañas en taquillas
SELECT taquillas_ETN.nombre AS 'taquilla',
       campañas_ETN.nombre AS 'campaña',
       campañas_ETN.fecha_inicio AS 'inicio',
       campañas_ETN.fecha_fin AS 'fin',
       estatus_individual AS 'status'
FROM taquillas_ETN
JOIN taquillas_campañas_ETN ON taquillas_ETN.id = taquillas_campañas_ETN.taquilla_id
JOIN campañas_ETN ON taquillas_campañas_ETN.campaña_id = campañas_ETN.id WHERE taquillas_ETN.nombre = 'Mexico Norte TQ1';

-- Ejemplo de Consulta taquillas en campañas
SELECT campañas_ETN.nombre AS 'Nombre de Campaña',
       taquillas_ETN.nombre AS 'Nombre de Taquilla',
       estatus_individual AS 'Estatus'
FROM campañas_ETN
JOIN taquillas_campañas_ETN ON campañas_ETN.id = taquillas_campañas_ETN.campaña_id
JOIN taquillas_ETN ON taquillas_campañas_ETN.taquilla_id = taquillas_ETN.id WHERE campañas_ETN.nombre = 'Aviso de privacidad';

