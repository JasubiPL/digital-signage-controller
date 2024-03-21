const express = require("express")
const colors = require("colors")
const createConnection = require("../db/db_connection")

const boxOfficeCampaigns = express.Router()

boxOfficeCampaigns.post("/query-campanias-en-taquilla", async (req, res) =>{

  console.log("===== Nueva Peticion a BD ====== \n" .cyan)
  
  const { company } = req.query
  const data = req.body
  
  try{
    console.log("✅ Conectando con la BD")
    const connection = await createConnection

    console.log(`✅ Buscando campañas activas en ${data.name}`)
    const [rows, fields] = await connection.query(
    `SELECT taquillas_${company}.nombre AS 'taquilla',
       campañas_${company}.nombre AS 'campania',
       campañas_${company}.fecha_inicio AS 'inicio',
       campañas_${company}.fecha_fin AS 'fin',
       estatus_individual AS 'status'
    FROM taquillas_${company}
    JOIN taquillas_campañas_${company} ON taquillas_${company}.id = taquillas_campañas_${company}.taquilla_id
    JOIN campañas_${company} ON taquillas_campañas_${company}.campaña_id = campañas_${company}.id
    WHERE taquillas_${company}.nombre = ?`, [data.name]
    )
    
    console.log(`✅ Enviando campañas activas en ${data.name}`)
    res.json({status: 200, data: rows})

  } catch (err) {
    console.log(err .red);
  }

})

boxOfficeCampaigns.post("/query-taquillas-en-campania", async (req, res) =>{

  console.log("===== Nueva Peticion a BD ====== \n" .cyan)
  
  const { company } = req.query
  const data = req.body
  
  try{
    console.log("✅ Conectando con la BD")
    const connection = await createConnection

    console.log(`✅ Buscando taquillas activas en ${data.name}`)
    const [rows, fields] = await connection.query(
    `SELECT campañas_${company}.nombre AS 'campaña',
      taquillas_${company}.nombre AS 'taquilla',
      estatus_individual AS 'status'
    FROM campañas_${company}
    JOIN taquillas_campañas_${company} ON campañas_${company}.id = taquillas_campañas_${company}.campaña_id
    JOIN taquillas_${company} ON taquillas_campañas_${company}.taquilla_id = taquillas_${company}.id 
    WHERE campañas_${company}.nombre = 'Aviso de privacidad';`, [data.name]
    )
    
    console.log(`✅ Enviando taquillas activas en ${data.name}`)
    res.json({status: 200, data: rows})

  } catch (err) {
    console.log(err .red);
  }

})

module.exports = boxOfficeCampaigns