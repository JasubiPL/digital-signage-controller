const mysql = require("mysql2/promise")

const config = {
  host: "localhost",
  user: "root",
  port: 3306,
  password: 'Q9spohTK1CY8fWa5c6L7*',
  database: "digital_signage_db"
}

async function createConnection() {
  const connection = await mysql.createConnection(config);
  
}

module.exports = createConnection();
