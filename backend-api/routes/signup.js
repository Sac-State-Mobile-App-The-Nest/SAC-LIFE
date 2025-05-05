const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../config');
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_TOKEN;
// CHANGE URL TO email-verify-web index.html
const CLIENT_URL = `https://christian-buco.github.io/testVerify/`;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// signup
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

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    const verificationUrl = `${CLIENT_URL}?token=${token}`;

    const msg = {
        to: email,
        from: 'saclife47@gmail.com',
        subject: 'Verify your Sac State email',
        html: `<p>Click below to verify your email:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>`,
    };

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
            INSERT INTO test_students (f_name, l_name, email)
            OUTPUT INSERTED.std_id
            VALUES (${f_name}, ${l_name}, ${email})
        `;

        const std_id = studentResult.recordset[0].std_id;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into login_info
        await sql.query`
            INSERT INTO login_info (std_id, username, hashed_pwd, first_login, is_active)
            VALUES (${std_id}, ${username}, ${hashedPassword}, 0, 1)
        `;

        await sgMail.send(msg);

        // // Success response
        // return res.status(201).json({ message: 'User created successfully.' });
        res.status(201).json({ message: 'Verification email sent' });

    } catch (error) {
        // console.error('Sign-up error:', error.message, error.stack);
        // return res.status(500).json({ message: 'Internal server error.' });
        console.error('SendGrid error:', error);
        res.status(500).json({ message: 'Failed to send verification email' });
    }
});

// verify
router.get('/verify', async (req, res) => {
    const { token } = req.query;

    try {

        console.log("Verifying token:", token);
        const decoded = jwt.verify(token, JWT_SECRET);
        const email = decoded.email;

        console.log("Decoded email:", email);

        // Mark email as verified on database
        await sql.connect(config);
        await sql.query`
            UPDATE test_students
            SET is_email_verified = 1
            WHERE std_id = (SELECT std_id FROM test_students WHERE email = ${email})
        `;

        console.log(`Email verified: ${email}`);

        res.status(200).json({ message: 'Email successfully verified' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid or expired verification token' });
    }
});

router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    try {
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
        const verificationUrl = `${CLIENT_URL}?token=${token}`;

        const msg = {
            to: email,
            from: 'saclife47@gmail.com',
            subject: 'Verify your Sac State email',
            html: `<p>Click below to verify your email:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>`,
        };

        await sgMail.send(msg);
        res.status(200).json({ message: 'Verification email resent.'});
    } catch (err) {
        console.error('Resend error:', err);
        res.status(500).json({ message: 'Failed to resend verification email.' });
    }

});

module.exports = router;
