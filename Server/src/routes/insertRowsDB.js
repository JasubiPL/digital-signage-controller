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
        return res.json({
          status: 409,
          message: "La taquilla ya existe en la base de datos"
        });
      }
    }   

    const [status] = await connection.execute(
      `INSERT INTO taquillas_${company} (nombre, dispositivo, proyeccion, estatus) VALUES (?, ?, ?, ?)`,
      [data.name, data.device, data.projection, data.status]
    )

    console.log(status);

    console.log("\nTaquillas guardadas con exito" .green); 
    res.json({
      status: 201,
      message: "Taquilla agregada con exito"
    })
  
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
        res.json({
          status: 409,
          message: "La Campaña ya existe en la base de datos"
        });
      }
    }   

    console.log(data)

    const [status] = await connection.execute(
      `INSERT INTO campañas_${company} (nombre, fecha_inicio, fecha_fin, estatus) VALUES (?, ?, ?, ?)`,
      [data.name, data.inicio, data.fin, data.status]
    )

    console.log(status);

    console.log("\nCampaña guardadas con exito" .green); 
    res.json({
      status: 201,
      message: "Campaña agregada con exito"
    })
  
  } catch (err) {
    console.log(err .red);
  }
})


// Insecionde Campañlas en taquillas ==============================>


insertRowDB.post("/add-campanias-en-taquilla", async (req, res) =>{
  const { company } = req.query
  const data = req.body
  console.log(`====== Nueva peticion para agregar campaña a taquilla ${company} ======` .cyan)

  try{
    console.log("\n✅ Conectando con BD")
    const connection = await createConnection

    console.log(`✅ Buscando campañas activas en ${data.boxOffice}`)
    const [rows, fields] = await connection.query(
    `SELECT taquillas_${company}.nombre AS 'taquilla',
       campañas_${company}.nombre AS 'campania',
       campañas_${company}.fecha_inicio AS 'inicio',
       campañas_${company}.fecha_fin AS 'fin',
       estatus_individual AS 'status'
    FROM taquillas_${company}
    JOIN taquillas_campañas_${company} ON taquillas_${company}.id = taquillas_campañas_${company}.taquilla_id
    JOIN campañas_${company} ON taquillas_campañas_${company}.campaña_id = campañas_${company}.id
    WHERE taquillas_${company}.nombre = ?`, [data.boxOffice]
    )
    
    console.log(`✅ Comprobando que no exita en la BD`)
    for (const campaign of rows) {
      if (campaign.campania === data.campaign) {
        console.log("❌ La Campaña ya existe en la taquilla" .red);
        res.json({
          status: 409,
          message: "La Campaña ya existe en la en la taquilla"
        });
      }
    }

    
    const [status] = await connection.execute(
      `INSERT INTO taquillas_campañas_${company} (taquilla_id, campaña_id, estatus_individual) 
       VALUES ((SELECT id FROM taquillas_${company} WHERE nombre = ?),
               (SELECT id FROM campañas_${company} WHERE nombre = ?), "ACTIVA")`,
      [data.boxOffice, data.campaign]
    )
    console.log(`✅ Campaña agregada con exito`)

    res.json({
      status: 201,
      message: "Campaña agregada con exito"
    })
  } catch (err) {
    console.log(err .red);
  }


})




module.exports = insertRowDB