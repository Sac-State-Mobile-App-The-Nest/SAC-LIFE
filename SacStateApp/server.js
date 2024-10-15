
const express = require("express");
const sql = require("mssql");
//const cors = require('cors')

require('dotenv').config();


const app = express();
app.use(express.json());

const config = {
    user: 'SacStateLifeAdmin',
    password: 'TheNest2024',
    server: 'csuslife.database.windows.net',
    database: 'csusLifeAppMainDB',
    options: {
        encrypt: true
    }
};

//sql connect(config) establishes connection to Azure SQL database using config
sql.connect(config).then(pool => {
    return pool.request().query('SELECT * FROM test');
}).then(result => {
    console.log(result);
}).catch(err => {
    console.error(err);
});