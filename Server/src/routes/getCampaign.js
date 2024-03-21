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
      `SELECT * FROM taquillas_${company}`
    );

    rows.map( row => taquillas = [...taquillas, row])

    console.log("\nEnviando datos recibidos =>" .green); 
    console.log(taquillas); 

    // Ordenamos los nombres de las taquillas alfabéticamente
    taquillas.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      if (nombreA < nombreB) {
        return -1;
      }
      if (nombreA > nombreB) {
        return 1;
      }
      return 0; // Si los nombres son iguales
    });
    
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
  let campanias = []

  try {
    const [rows, fields] = await connection.query(
      `SELECT * FROM campañas_${company}`
    );

    rows.map( row => campanias = [...campanias, {
      id: row.id,
      nombre: row.nombre,
      inicio: row.fecha_inicio,
      fin: row.fecha_fin,
      status: row.estatus
    }])

    console.log("\nEnviando datos recibidos =>" .green); // results contains rows returned by server
    console.log(campanias); // results contains rows returned by server
    
    res.json(campanias)

    // Ordenamos los nombres de las taquillas alfabéticamente
    campanias.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      if (nombreA < nombreB) {
        return -1;
      }
      if (nombreA > nombreB) {
        return 1;
      }
      return 0; // Si los nombres son iguales
    });
  
  } catch (err) {
    console.log(err .red);
  }
})


module.exports = getCampaign