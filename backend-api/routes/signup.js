const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../config');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();
    const f_name = req.body.f_name?.trim();
    const l_name = req.body.l_name?.trim();
    const email = req.body.email?.trim();

    // Validate required fields
    if (!username || !password || !f_name || !l_name || !email) {
        return res.status(400).json({ message: 'First name, last name, username, password, and email are required.' });
    }

    // Basic password strength check
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // Optional: Sac State email enforcement (server-side)
    const sacStateEmailRegex = /^[a-zA-Z0-9._%+-]+@csus\.edu$/;
    if (!sacStateEmailRegex.test(email)) {
        return res.status(400).json({ message: 'Email must be a valid Sac State address ending in @csus.edu.' });
    }

    try {
        await sql.connect(config);

        // Check if username already exists
        const existingUser = await sql.query`
            SELECT * FROM login_info WHERE username = ${username}
        `;
        if (existingUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Username already taken.' });
        }

        // Insert into test_students
        const studentResult = await sql.query`
            INSERT INTO test_students (f_name, l_name, m_name, email)
            OUTPUT INSERTED.std_id
            VALUES (${f_name}, ${l_name}, 'N/A', ${email})
        `;

        const std_id = studentResult.recordset[0].std_id;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into login_info
        await sql.query`
            INSERT INTO login_info (std_id, username, hashed_pwd, first_login, is_active)
            VALUES (${std_id}, ${username}, ${hashedPassword}, 0, 1)
        `;

        // Success response
        return res.status(201).json({ message: 'User created successfully.' });

    } catch (error) {
        console.error('Sign-up error:', error.message, error.stack);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
