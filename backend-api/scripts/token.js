const jwt = require('jsonwebtoken');

// Replace 'your_secret_key' with a strong secret key or load it from an environment variable
const secretKey = 'your_secret_key';

// Define the payload (data) to include in the JWT
const payload = {
  id: Math.floor(Math.random() * 1000000), // Example: Random user ID
  username: 'admin', // Example: username
  role: 'admin', // Example: admin role
};

// Define token options
const options = {
  expiresIn: '1h', // Token expiration time
};

// Generate the JWT
const token = jwt.sign(payload, secretKey, options);

console.log('Generated JWT:', token);
