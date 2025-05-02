const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { getMessaging } = require('../firebaseAdmin');

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
             IF NOT EXISTS (
                SELECT 1 FROM fcm_tokens WHERE fcm_token = @fcmToken
            )
            BEGIN
                INSERT INTO fcm_tokens (std_id, fcm_token, device_info)
                VALUES (@userId, @fcmToken, @deviceInfo)
            END
            ELSE
            BEGIN
                UPDATE fcm_tokens
                SET std_id = @userId, device_info = @deviceInfo, last_seen = GETDATE()
                WHERE fcm_token = @fcmToken
            END
        `);

        res.status(200).json({ message: 'FCM Token saved successfully' });
    } catch (err) {
        console.error('Error saving FCM token:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE endpoint to remove FCM token
router.delete('/remove-token', async (req, res) => {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
        return res.status(400).json({ message: 'Missing userId or fcmToken' });
    }

    try {
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('fcmToken', sql.VarChar, fcmToken);

        await request.query(`
            DELETE FROM fcm_tokens
            WHERE std_id = @userId AND fcm_token = @fcmToken
        `);

        res.status(200).json({ message: 'FCM Token removed successfully' });
    } catch (err) {
        console.error('Error deleting FCM token:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/welcome', async (req, res) => {
    const { userId, title, body } = req.body;
    console.log('/welcome hit with userId:', userId);

    if (!userId || !title || !body) {
        return res.status(400).json({ message: 'Missing userId, title, or body' });
    }

    try {
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            SELECT fcm_token FROM fcm_tokens WHERE std_id = @userId
        `);

        const tokens = [...new Set(result.recordset.map(row => row.fcm_token))];

        console.log(" Raw FCM tokens from DB:", result.recordset); 
        console.log("Tokens found:", tokens.length, tokens);

        if (tokens.length === 0) {
            console.warn(" No FCM tokens found for user:", userId);
            return res.status(404).json({ message: 'No FCM tokens found for user' });
        }

        const messaging = getMessaging();

        const message = {
            notification: { title, body },
            tokens,
        };

        const response = await messaging.sendEachForMulticast(message);
        console.log("Push notification sent successfully to FCM");

        console.log("Firebase sendMulticast response:", response);
        if (response.failureCount > 0) {
            for (let i = 0; i < response.responses.length; i++) {
                const res = response.responses[i];
                if (!res.success) {
                    const errorMsg = res.error.message;
                    console.warn(`Failed to send to token [${tokens[i]}]:`, errorMsg);
        
                    if (errorMsg.includes('Requested entity was not found')) {
                        // Remove the invalid token from the database
                        const deleteRequest = new sql.Request();
                        deleteRequest.input('fcmToken', sql.VarChar, tokens[i].trim());
                        await deleteRequest.query(`DELETE FROM fcm_tokens WHERE fcm_token = @fcmToken`);
                        console.log(`Cleaned up invalid token: ${tokens[i]}`);
                    }
                }
            }
        }
        
        res.status(200).json({ message: 'Notification sent', successCount: response.successCount });
    } catch (err) {
        console.error('Error sending welcome notification:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Wellness notifications route
router.post('/wellness', async (req, res) => {
    const { userId, score } = req.body;
    console.log('/wellness hit with userId:', userId, 'score:', score);

    if (!userId || typeof score !== 'number') {
        return res.status(400).json({ message: 'Missing userId or score' });
    }

    let title = "Your Wellness Update";
    let body = "";
    let resource_link = "";

    const percentage = (score / 25) * 100;

    if (percentage < 30) {
        body = "Your score suggests you may be having a tough time. Reach out for support—Sac State cares about you 💚.";
        resource_link = "https://www.csus.edu/student-life/health-counseling/counseling";
    } else if (percentage < 60) {
        body = "You're doing okay, but don't hesitate to use our wellness resources to boost your mood and energy.";
        resource_link = "https://www.csus.edu/student-life/health-counseling/wellness-education/presentations.html";
    } else {
        body = "You're thriving! Keep up the great work and take a moment to celebrate your well-being 🎉.";
        resource_link = "https://www.csus.edu/student-life/health-counseling";
    }

    try {
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            SELECT fcm_token FROM fcm_tokens WHERE std_id = @userId
        `);

        const tokens = [...new Set(result.recordset.map(row => row.fcm_token))];
        if (tokens.length === 0) {
            console.warn("No FCM tokens found for user:", userId);
            return res.status(404).json({ message: 'No FCM tokens found for user' });
        }

        const messaging = getMessaging();

        const message = {
            notification: { title, body },
            data: { resource_link: resource_link },
            tokens,
        };

        const response = await messaging.sendEachForMulticast(message);
        console.log("Wellness notification sent to", response.successCount, "devices");

        if (response.failureCount > 0) {
            for (let i = 0; i < response.responses.length; i++) {
                const res = response.responses[i];
                if (!res.success) {
                    const errorMsg = res.error.message;
                    console.warn(`Failed to send to token [${tokens[i]}]:`, errorMsg);

                    if (errorMsg.includes('Requested entity was not found')) {
                        const deleteRequest = new sql.Request();
                        deleteRequest.input('fcmToken', sql.VarChar, tokens[i].trim());
                        await deleteRequest.query(`DELETE FROM fcm_tokens WHERE fcm_token = @fcmToken`);
                        console.log(`Cleaned up invalid token: ${tokens[i]}`);
                    }
                }
            }
        }

        res.status(200).json({ message: 'Wellness notification sent', successCount: response.successCount });
    } catch (err) {
        console.error('Error sending wellness notification:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;