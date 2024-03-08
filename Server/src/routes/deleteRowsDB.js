const express = require("express")
const colors = require("colors")
const createConnection = require("../db/db_connection")

const deleteRowDB = express.Router()

deleteRowDB.post('/delete-taquilla', async (req, res) =>{
  const { company } = req.query
  const data = req.body
  console.log(`====== Nueva peticion para eliminar taquillas a ${company} ======` .blue)
  
  try {
    console.log("\nConectando con BD y buscando la taquilla..." .yellow)
    const connection = await createConnection

    const [rows, fields] = await connection.query(
      `SELECT nombre FROM taquillas_${company}`
    );

    for (const taquilla of rows) {
      if (taquilla.nombre === data.name) {
        const [status] = await connection.execute(
          `DELETE FROM taquillas_${company} WHERE nombre = ?`,
          [data.name]
        )
        console.log(status);
        console.log("\nLa taquilla fue borrada con exito" .green);
        res.status(204).json("LLa taquilla fue borrada con exito");
        return
      }
    }   


    console.log("\nTaquilla no existe en la Base de Datos" .red); 
    res.status(404).json("Taquilla no existe en la Base de Datos")
  
  } catch (err) {
    console.log(err .red);
  }
})

deleteRowDB.post('/delete-campania', async (req, res) =>{
  const { company } = req.query
  const data = req.body
  console.log(`====== Nueva peticion para eliminar campaña en ${company} ======` .blue)
  
  try {
    console.log("\nConectando con BD y buscando la campaña..." .yellow)
    const connection = await createConnection

    const [rows, fields] = await connection.query(
      `SELECT nombre FROM campañas_${company}`
    );

    for (const campania of rows) {
      if (campania.nombre === data.name) {
        const [status] = await connection.execute(
          `DELETE FROM campañas_${company} WHERE nombre = ?`,
          [data.name]
        )
        console.log(status);
        console.log("\nLa campaña fue borrada con exito" .green);
        res.json("La campaña fue borrada con exito");
        return
      }
    }   


    console.log("\nCampaña no existe en la Base de Datos" .red); 
    res.status(404).json("Campaña no existe en la Base de Datos")
  
  } catch (err) {
    console.log(err .red);
  }
})

module.exports = deleteRowDB