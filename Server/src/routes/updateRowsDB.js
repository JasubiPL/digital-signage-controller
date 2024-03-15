const express = require("express");
const colors = require("colors");
const createConnection = require("../db/db_connection");

const updateRowDB = express.Router();

updateRowDB.put('/edit-taquilla', async (req, res) => {
  const { company } = req.query;
  const data = req.body; // Supongamos que newData es un objeto con los nuevos valores para la fila

  console.log(`====== Nueva peticion para eliminar taquillas a ${company} ======` .blue)
  console.log(data)

  try {
    console.log("\nConectando con BD y buscando la taquilla..." .yellow)
    const connection = await createConnection

    const [rows, fields] = await connection.query(
      `SELECT id FROM taquillas_${company}`
    );

    for (const taquilla of rows) {
      if (taquilla.id === data.id) {
        const [status] = await connection.execute(
          `UPDATE taquillas_${company} SET nombre = ?, dispositivo = ?, proyeccion = ?, estatus = ? WHERE id = ?`,
          [data.name, data.device, data.projection, data.status, data.id]
        );

        console.log(status);
        console.log("\nLa taquilla fue modificada con exito" .green);
        res.json({
          status: 200,
          message: "La taquilla fue modificada borrada con exito"
        });
        return
      }
    }   

    console.log("\nTaquilla no existe en la Base de Datos" .red); 
    res.json("Taquilla no existe en la Base de Datos")
  
  } catch (err) {
    console.log(err .red);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = updateRowDB;
