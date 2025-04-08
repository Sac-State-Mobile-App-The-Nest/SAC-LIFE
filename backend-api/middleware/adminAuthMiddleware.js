const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { poolPromise } = require('../db');
// Define the list of valid roles for admin users
const VALID_ROLES = ['super-admin', 'content-manager', 'support-admin', 'read-only'];

/**
 * Middleware to authenticate an access token.
 * Ensures that only requests with a valid token can proceed.
 */
const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        console.log("No token found in request.");
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
        console.log("Token successfully verified:", decoded);

        // Check if the user is still active
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.VarChar, decoded.username)
            .query('SELECT is_active FROM admin_login WHERE username = @username');

        if (
            result.recordset.length === 0 ||
            result.recordset[0].is_active !== true // Handles false and 0
        ) {
            console.log(`Admin "${decoded.username}" is inactive or not found.`);
            return res.status(403).json({ message: 'Your account has been deactivated.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            console.log("Token expired:", err.message);
            return res.status(401).json({ message: 'Token Expired' });
        }
        console.log("Token verification failed:", err.message);
        return res.status(403).json({ message: 'Invalid Token' });
    }
};

/**
 * Middleware to verify a refresh token.
 * Used for renewing access tokens when the access token expires.
 */
const verifyRefreshToken = (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Access Denied. No refresh token provided." });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, user) => {
        if (err) {
            console.log("Refresh Token verification failed:", err.message);
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        console.log("Refresh Token verified successfully.");
        req.user = user; // Attach user data for refreshing access token
        next();
    });
};

/**
 * Middleware for Role-Based Access Control (RBAC).
 * Allows access only if the user has a valid role.
 * @param {string[]} allowedRoles - Array of roles that are permitted to access the route.
 */
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!VALID_ROLES.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next(); // Proceed to the next middleware or route handler
    };
};

module.exports = { authenticateToken, verifyRefreshToken, verifyRole, VALID_ROLES };