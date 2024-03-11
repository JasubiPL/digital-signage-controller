DROP DATABASE IF EXISTS digital_signage_db;

-- Creamos la BD
CREATE DATABASE IF NOT EXISTS digital_signage_db;

show databases;

USE digital_signage_db;

-- Creamos las tablas
CREATE TABLE IF NOT EXISTS taquillas_ETN (
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

CREATE TABLE taquillas_campañas_ETN(
	taquilla_id INT REFERENCES taquillas_ETN(id),
    campaña_id INT REFERENCES campañas_ETN(id),
    PRIMARY KEY (taquilla_id, campaña_id)
);


show tables;

-- Insertamos relacion
-- Ejemplo de insercion
-- INSERT INTO taquillas_campañas_ETN(taquilla_id, campaña_id) VALUES ((SELECT id FROM taquillas_ETN WHERE nombre = 'Mexico Norte'),(SELECT id FROM campañas_ETN WHERE nombre = 'No discriminacion'));

-- Mostramos datos
SELECT * FROM taquillas_ETN;
SELECT * FROM campañas_ETN;
SELECT * FROM taquillas_campañas_ETN;

-- Ejemplo de Consulta
SELECT taquillas_ETN.nombre AS 'Nombre de Taquilla',
       campañas_ETN.nombre AS 'Nombre de Campaña',
       campañas_ETN.fecha_inicio AS 'Fecha de Inicio',
       campañas_ETN.fecha_fin AS 'Fecha de Fin',
       campañas_ETN.estatus AS 'Estatus'
FROM taquillas_ETN
JOIN taquillas_campañas_ETN ON taquillas_ETN.id = taquillas_campañas_ETN.taquilla_id
JOIN campañas_ETN ON taquillas_campañas_ETN.campaña_id = campañas_ETN.id;
