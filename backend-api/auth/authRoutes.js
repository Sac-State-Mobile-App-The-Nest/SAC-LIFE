const express = require('express');
const authService = require('./authService'); // Handles authentication logic
const router = express.Router();

console.log("✅ authRoutes.js is being loaded..."); // Debugging

// Login Route: Redirects to IdP for authentication
router.post('/login', (req, res, next) => {
    console.log("✅ Received request at /auth/login");
    authService.login(req, res, next);
});

// Callback Route: Handles SAML response from IdP
router.post('/callback', (req, res, next) => {
    console.log("Received request at /auth/callback");
    authService.callback(req, res, next);
});

// Allow browsers to trigger SAML login via GET request
router.get('/login', (req, res, next) => {
    console.log("Received GET request at /auth/login (Browser SAML Login)");
    authService.login(req, res, next);
})

module.exports = router;