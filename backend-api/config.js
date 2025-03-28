require('dotenv').config();

//Server configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true // Allow self-signed certs (set to false in production)
    }
};

module.exports = config;