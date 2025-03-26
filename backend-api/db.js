// db.js
const sql = require("mssql");
const config = require("./config");

const poolPromise = sql.connect(config)
  .then(pool => {
    console.log(" Connected to SQL Database");
    return pool;
  })
  .catch(err => {
    console.error(" Database connection error:", err);
    process.exit(1);
  });

module.exports = { poolPromise };