const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('../config');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();
    const f_name = req.body.f_name?.trim();
    const l_name = req.body.l_name?.trim();

    if (!username || !password || !f_name || !l_name) {
        return res.status(400).json({ message: 'First name, last name, username, and password are required.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    try {
        await sql.connect(config);

        // Check if username already exists in login_info
        const existingUser = await sql.query`
            SELECT * FROM login_info WHERE username = ${username}
        `;
        if (existingUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Username already taken.' });
        }

        // Insert into test_students first and get the new std_id
        const studentResult = await sql.query`
            INSERT INTO test_students (f_name, l_name, m_name)
            OUTPUT INSERTED.std_id
            VALUES (${f_name}, ${l_name}, 'N/A')
        `;

        const std_id = studentResult.recordset[0].std_id;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into login_info using the std_id
        await sql.query`
            INSERT INTO login_info (std_id, username, hashed_pwd, first_login, is_active)
            VALUES (${std_id}, ${username}, ${hashedPassword}, 0, 1)
        `;

        // Handle authentication mode: JWT or SAML
        const authMode = process.env.AUTH_MODE || 'JWT';
        if (authMode === 'JWT') {
            const token = jwt.sign({ username }, process.env.JWT_SECRET || 'default_secret');
            return res.status(201).json({ message: 'User created', token });
        } else if (authMode === 'SAML') {
            return res.status(201).json({ message: 'User created. SAML login will be used.' });
        } else {
            return res.status(500).json({ message: 'Unsupported authentication mode.' });
        }

    } catch (error) {
        console.error('Sign-up error:', error.message, error.stack);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
