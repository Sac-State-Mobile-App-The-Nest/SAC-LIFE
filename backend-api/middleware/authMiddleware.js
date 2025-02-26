const jwt = require('jsonwebtoken');

// Define the list of valid roles for admin users
const VALID_ROLES = ['super-admin', 'content-manager', 'support-admin', 'read-only'];

/**
 * Middleware to authenticate a JWT token.
 * Ensures that only requests with a valid token can proceed.
 */
const authenticateToken = (req, res, next) => {
    // Extract the token from the Authorization header (Bearer token format)
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        console.log("No token found in request.");
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    // Verify the JWT token using the secret key
    jwt.verify(token, process.env.JWT_SECRET_ADMIN, (err, user) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                console.log("Token expired:", err.message);
                return res.status(401).json({ message: 'Token Expired' }); // Expired token respons
            }
            console.log("Token verification failed:", err.message);
            return res.status(403).json({ message: 'Invalid Token' });
        }

        console.log(" Token successfully verified!");
        console.log(" Decoded token data:", user);

        req.user = user; // Attach the decoded user information to the request object
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

module.exports = { authenticateToken, verifyRole, VALID_ROLES };