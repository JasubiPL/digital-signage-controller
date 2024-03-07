const express = require("express")
const colors = require("colors")
const fs = require("fs")
const path = require("path")
const mysql = require("mysql2/promise")

const getCampaign = express.Router()

const config = {
  host: "localhost",
  user: "root",
  port: 3306,
  password: 'Q9spohTK1CY8fWa5c6L7*',
  database: "digital_signage_db"
}



getCampaign.get("/get-campaign", async (req, res) =>{

  const connection = await mysql.createConnection(config);

  try {
    const [results, fields] = await connection.query(
      'SELECT * FROM taquillas_ETN'
    );

    res.json(results)
  
    console.log(results); // results contains rows returned by server
  } catch (err) {
    console.log(err);
  }
})


module.exports = getCampaign