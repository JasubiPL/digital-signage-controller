-- Creamos la BD
CREATE DATABASE IF NOT EXISTS taquillas_db;

show databases;

USE taquillas_db;

-- Creamos las tablas
CREATE TABLE IF NOT EXISTS taquillas (
	taquilla_id VARCHAR(50) NOT NULL UNIQUE,
    campaña VARCHAR(100) NOT NULL,
    estatus varchar (30) NOT NULL,
    PRIMARY KEY(taquilla_id)
);

CREATE TABLE IF NOT EXISTS campañas (
	campaña_id VARCHAR(100) NOT NULL UNIQUE,
    taquilla VARCHAR(50) NOT NULL,
    PRIMARY KEY(campaña_id)
);

show tables;

SELECT * FROM taquillas;

SELECT * FROM campañas;

-- Eliminar tablas
DROP TABLE IF EXISTS taquillas, campañas;

-- Insertamos valores iniciales en la tabla taquillas
INSERT INTO taquillas(taquilla_id, campaña, estatus) VALUES 
('holissss');