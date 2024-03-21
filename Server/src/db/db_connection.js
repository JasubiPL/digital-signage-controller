require('dotenv').config()
const mysql = require("mysql2/promise")

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}

async function createConnection() {
  const connection = await mysql.createConnection(config);
  return connection
  
}

module.exports = createConnection()
