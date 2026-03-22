const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  database: "tuwaze",
  user: "root",
  password: "tendamema",
  port: 3306,
});

module.exports = connection;
