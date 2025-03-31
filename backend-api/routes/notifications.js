const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Endpoint to register FCM token
router.post('/register-token', async (req, res) => {
    const { userId, fcmToken, deviceInfo } = req.body;

    if (!userId || !fcmToken) {
        return res.status(400).json({ message: 'Missing userId or fcmToken' });
    }

    try {
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('fcmToken', sql.VarChar, fcmToken);
        request.input('deviceInfo', sql.VarChar, deviceInfo || null);

        // Save token into login_info table (make sure fcm_token column exists!)
        await request.query(`
            INSERT INTO fcm_tokens (std_id, fcm_token, device_info)
            VALUES (@userId, @fcmToken, @deviceInfo)
        `);

        res.status(200).json({ message: 'FCM Token saved successfully' });
    } catch (err) {
        console.error('Error saving FCM token:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;