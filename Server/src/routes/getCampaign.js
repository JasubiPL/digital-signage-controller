const express = require("express")
const colors = require("colors")
const createConnection = require("../db/db_connection")

const getCampaign = express.Router()

getCampaign.get("/get-taquillas", async (req, res) =>{
  const { company } = req.query
  console.log(`====== Nueva consulta a taquillas ${company} ======` .blue)
  
  console.log("Conectando con BD y trayendo datos..." .yellow)
  let taquillas = []
  
  try {
    const connection = await createConnection
    const [rows, fields] = await connection.query(
      `SELECT nombre FROM taquillas_${company}`
    );

    rows.map( row => taquillas = [...taquillas, row.nombre])

    console.log("\nEnviando datos recibidos =>" .green); // results contains rows returned by server
    console.log(taquillas); // results contains rows returned by server
    
    res.json(taquillas)
  
  } catch (err) {
    console.log(err .red);
  }
})

getCampaign.get("/get-campanias", async (req, res) =>{
  const { company } = req.query
  console.log(`Nueva consulta a taquillas ${company}` .blue)
  
  console.log("Conectando con BD y trayendo datos..." .yellow)
  const connection = await createConnection
  let taquillas = []

  try {
    const [rows, fields] = await connection.query(
      `SELECT nombre FROM campañas_${company}`
    );

    rows.map( row => taquillas = [...taquillas, row.nombre])

    console.log("\nEnviando datos recibidos =>" .green); // results contains rows returned by server
    console.log(taquillas); // results contains rows returned by server
    
    res.json(taquillas)
  
  } catch (err) {
    console.log(err .red);
  }
})


module.exports = getCampaign