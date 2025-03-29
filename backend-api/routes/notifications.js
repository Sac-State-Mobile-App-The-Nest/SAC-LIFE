const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Endpoint to register FCM token
router.post('/register-token', async (req, res) => {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
        return res.status(400).json({ message: 'Missing userId or fcmToken' });
    }

    try {
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('fcmToken', sql.VarChar, fcmToken);

        // Save token into login_info table (make sure fcm_token column exists!)
        await request.query(`
            UPDATE login_info
            SET fcm_token = @fcmToken
            WHERE std_id = @userId
        `);

        res.status(200).json({ message: 'FCM Token saved successfully' });
    } catch (err) {
        console.error('Error saving FCM token:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;