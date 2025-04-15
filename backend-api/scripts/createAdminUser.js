require('dotenv').config({ path: __dirname + '/../.env' });

const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../config'); // Database configuration

// Initialize SQL connection pool
const poolPromise = sql.connect(config)
    .then(pool => {
        console.log('Connected to SQL Database');
        return pool;
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1); // Exit if connection fails
    });

// Function to create an admin user
const createAdminUser = async (username, plainPassword, role) => {
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash password
        const pool = await poolPromise;
        await pool.request().query(`
            INSERT INTO admin_login (username, password, role) 
            VALUES ('${username}', '${hashedPassword}', '${role}')
        `);
        console.log('Admin user created successfully!');
    } catch (err) {
        console.error('Error creating admin user:', err);
    }
};

// Call the function with desired credentials
createAdminUser('admin3', 'admin123', 'super-admin'); // Replace with your admin credentials