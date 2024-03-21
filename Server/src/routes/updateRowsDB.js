const express = require("express");
const colors = require("colors");
const createConnection = require("../db/db_connection");

const updateRowDB = express.Router();

updateRowDB.put('/edit-taquilla', async (req, res) => {
  const { company } = req.query;
  const data = req.body; 

  console.log(`====== Nueva peticion para actualizar taquillas a ${company} ======` .blue)
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

updateRowDB.put('/edit-campania', async (req, res) => {
  const { company } = req.query;
  const data = req.body; 
  console.log(`====== Nueva peticion para actualizar campañas a ${company} ======` .blue)
  console.log(data)

  try {
    console.log("\nConectando con BD y buscando la Campaña..." .yellow)
    const connection = await createConnection

    const [rows, fields] = await connection.query(
      `SELECT id FROM campañas_${company}`
    );

    for (const campania of rows) {
      if (campania.id === data.id) {
        const [status] = await connection.execute(
          `UPDATE campañas_${company} SET nombre = ?, fecha_inicio = ?, fecha_fin = ?, estatus = ? WHERE id = ?`,
          [data.name, data.inicio, data.fin, data.status, data.id]
        );

        console.log(status);
        console.log("\nLa campaña fue modificada con exito" .green);
        res.json({
          status: 200,
          message: "La campaña fue modificada borrada con exito"
        });
        return
      }
    }   

    console.log("\ncampaña no existe en la Base de Datos" .red); 
    res.json("campaña no existe en la Base de Datos")
  
  } catch (err) {
    console.log(err .red);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

updateRowDB.put('/edit-campanias-en-taquilla', async (req, res) => {
  const { company } = req.query;
  const data = req.body; 
  console.log(`====== Nueva peticion para actualizar campañas en ${data.boxOffice} ======` .cyan)
  console.log(data)

  try {
    console.log("\nConectando con BD y buscando la Campaña..." .yellow)
    const connection = await createConnection

    const [rows, fields] = await connection.query(
      `SELECT id FROM campañas_${company}`
    );

    const [status] = await connection.execute(
      `UPDATE taquillas_campañas_${company} SET estatus_individual = ?
       WHERE taquilla_id = (SELECT id FROM taquillas_${company} WHERE nombre = ?) 
       AND campaña_id = (SELECT id FROM campañas_${company} WHERE nombre = ?);`,
      [data.status, data.boxOffice, data.campaign]
    )

    res.json({
      status: 200,
      message: "Taquilla Actualizada"
    })
  
  } catch (err) {
    console.log(err .red);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = updateRowDB;
