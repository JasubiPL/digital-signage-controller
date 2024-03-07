const express = require("express")
const colors = require("colors")
const createConnection = require("../db/db_connection")

const insertRowDB = express.Router()

insertRowDB.post('/add-taquilla', async (req, res) =>{
  const { company } = req.query
  const data = req.body
  console.log(`====== Nueva peticion para agregar taquillas a ${company} ======` .blue)
  
  try {
    console.log("\nConectando con BD y comprobando que no exista la taquilla..." .yellow)
    const connection = await createConnection

    const [rows, fields] = await connection.query(
      `SELECT nombre FROM taquillas_${company}`
    );

    for (const taquilla of rows) {
      if (taquilla.nombre === data.name) {
        console.log("\nLa taquilla ya existe en la Base de datos" .red);
        return res.status(300).json("La taquilla ya existe en la base de datos");
      }
    }   

    const [status] = await connection.execute(
      `INSERT INTO taquillas_${company} (nombre) VALUES (?)`,
      [data.name]
    )

    console.log(status);

    console.log("\nTaquillas guardadas con exito" .green); 
    res.status(201).json("Taquilla agregada con exito")
  
  } catch (err) {
    console.log(err .red);
  }
})

insertRowDB.post('/add-campania', async (req, res) =>{
  const { company } = req.query
  const data = req.body
  console.log(`====== Nueva peticion para agregar taquillas a ${company} ======` .blue)
  
  try {
    console.log("\nConectando con BD y comprobando que no exista la taquilla..." .yellow)
    const connection = await createConnection

    const [rows, fields] = await connection.query(
      `SELECT nombre FROM campañas_${company}`
    );

    for (const campania of rows) {
      if (campania.nombre === data.name) {
        console.log("\nLa Campaña ya existe en la Base de datos" .red);
        return res.status(300).json("La Campaña ya existe en la base de datos");
      }
    }   

    const [status] = await connection.execute(
      `INSERT INTO campañas_${company} (nombre) VALUES (?)`,
      [data.name]
    )

    console.log(status);

    console.log("\nCampaña guardadas con exito" .green); 
    res.status(201).json("Campaña agregada con exito")
  
  } catch (err) {
    console.log(err .red);
  }
})

module.exports = insertRowDB