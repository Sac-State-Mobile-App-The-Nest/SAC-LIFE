const express = require('express');
const authService = require('./authService'); // Handles authentication logic
const router = express.Router();

// Login Route: Redirects to IdP for authentication
router.post('/login', (req, res, next) => {
    console.log("Received request at /auth/login");
    authService.login(req, res, next);
});

// Callback Route: Handles SAML response from IdP
router.post('/callback', (req, res, next) => {
    console.log("Received request at /auth/callback");
    console.log("🔍 Request Headers:", req.headers);    // Debugging
    // console.log("🔍 Request Body:", JSON.stringify(req.body, null, 2)); // Debugging
    let rawData = '';
    req.on('data', chunk => { rawData += chunk; });
    req.on('end', () => {
        console.log("🔍 Raw Request Body:", rawData);
    });
    authService.callback(req, res, next);
});

// Allow browsers to trigger SAML login via GET request
router.get('/login', (req, res, next) => {
    console.log("Received GET request at /auth/login (Browser SAML Login)");
    authService.login(req, res, next);
})

module.exports = router;