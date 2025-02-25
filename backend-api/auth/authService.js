/**
 * Run this to install most of the necessary packages:
 *  npm install @node-saml/passport-saml passport express-session xml2js
 *  npm install -g ngrok
 *      - This package is necessary for SSOCircle and local SAML testing
 * 
 * These are what all the packages are responsible for:
 *  @node-saml/passport-saml  → Handles actual SAML authentication
 *  passport → Authentication middleware for Node.js
 *  express-session → Stores session data (needed for SAML authentication flow)
 *  xml2js → Parses SAML XML responses (useful for debugging)
 * 
 * 
*/

require('dotenv').config();
const jwtAuth = require('./jwtAuth');
const samlAuth = require('./samlAuth');

const AUTH_METHOD = process.env.AUTH_METHOD || 'jwt'; // Default to JWT if undefined

const authService = {
    login: async (req, res, next) => {
        console.log("authService.login has been called...");
        try {   
            if (AUTH_METHOD === 'saml') {
                console.log("Redirecting user to SAML authentication...");
                return samlAuth.login(req, res, next);
            } else {
                console.log("Handling JWT login...");
                return jwtAuth.login(req, res);
            }
        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ message: "Internal Server Error during login." });
        }
    },

    callback: async (req, res, next) => {
        try {
            if (AUTH_METHOD === 'saml') {
                console.log("Processing SAML authentication callback...");
                return samlAuth.callback(req, res, next);
            } else {
                return res.status(400).json({ message: "SAML authentication is not enabled." });
            }
        } catch (error) {
            console.error("SAML Callback Error:", error);
            res.status(500).json({ message: "Internal Server Error during SAML callback." });
        }
    },

    verifyToken: async (token) => {
        try {
            if (AUTH_METHOD === 'saml') {
                return samlAuth.verifyToken(token);
            } else {
                return jwtAuth.verifyToken(token);
            }
        } catch (error) {
            console.error("Token Verification Error:", error);
            return null;
        }
    }
};

module.exports = authService;