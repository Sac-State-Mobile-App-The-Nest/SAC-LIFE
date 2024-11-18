const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Split the "Bearer <token>"

    if (!token) {
        return res.status(401).send('Access denied. No token provided');
    }

    // Token verification
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, user) => {
        if (err) {
            return res.status(403).send('Invalid token.');
        }
        // Attach the user information (decoded JWT) to the request object
        req.user = user;
        console.log("In authenticateToken function");
        console.log(user);
        next(); // Pass the request to the next middleware/route handler
    });
};

module.exports = { authenticateToken };