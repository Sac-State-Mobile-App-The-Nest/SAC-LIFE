const jwt = require('jsonwebtoken');
const VALID_ROLES = ['super-admin', 'content-manager', 'support-admin', 'read-only'];

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        console.log("No token found in request.");
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET_ADMIN, (err, user) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                console.log("Token expired:", err.message);
                return res.status(401).json({ message: 'Token Expired' });  // Change 403 → 401
            }
            console.log("Token verification failed:", err.message);
            return res.status(403).json({ message: 'Invalid Token' });
        }

        console.log(" Token successfully verified!");
        console.log(" Decoded token data:", user);

        req.user = user; // Stores user data in request
        next();
    });
};

// Middleware for Role-Based Access Control (RBAC)
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!VALID_ROLES.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};

module.exports = { authenticateToken, verifyRole, VALID_ROLES };