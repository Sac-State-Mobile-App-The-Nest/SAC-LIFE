const express = require('express');
const sql = require("mssql");
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session'); // Added session middleware for SAML
const port = 5000;
const config = require('./config'); //server config file

// Import only the router from `jwtAuth.js` to avoid object-related issues
const { router: login_infoRoute } = require('./auth/jwtAuth');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());
app.use(bodyParser.json());

// Initialize session middleware (Required for SAML)
app.use(session({
  secret: process.env.SESSION_SECRET || 'super-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // Ensure Passport can store SAML session data

// Import authentication routes (handles SAML & JWT)
const authRoutes = require('./auth/authRoutes');
const authMiddleware = require('./authMiddleware'); // Middleware for JWT authentication

console.log("Registering authRoutes at /auth");
app.use('/auth', (req, res, next) => {
  console.log("🔹 Incoming request to /auth:", req.method, req.url);
  next();
}, authRoutes);

// Initialize SQL connection pool once
const poolPromise = sql.connect(config)
  .then(pool => {
    console.log('Connected to SQL Database');
    return pool;
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1); // Exit if connection fails
  });

const studentsRoute = require('./routes/students')(poolPromise);
const campus_servicesRoute = require('./routes/campus_services')(poolPromise);
const tagsRoute = require('./routes/tags');
const adminLoginRoute = require('./routes/admin_login')(poolPromise);

app.use('/api/students', studentsRoute);
app.use('/api/campus_services', campus_servicesRoute);
app.use('/api/tags', tagsRoute);
// app.use('/api/login_info', login_infoRoute);
app.use('/api', adminLoginRoute);

// Protected Route Example (Requires JWT Auth)
app.get('/api/protected', authMiddleware.authenticateToken, (req, res) => {
    res.json({ message: "Protected route accessed!", user: req.user });
});

// Add a health check route
app.get('/', (req, res) => {
    res.send("SAML + JWT Authentication Server is running! 🚀");
});

app.get('/api/helloMessage', (req, res) => {
    res.send('Hello from Node.js backend!');
});

// Console debugs to see if all our login routes are mounting correctly
console.log("✅ Registered Routes:");
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route.path);
    } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((subMiddleware) => {
            if (subMiddleware.route) {
                console.log(subMiddleware.route.path);
            }
        });
    }
});


app.listen(port, ()=>{
    console.log(`Server running on port http://localhost:${port}`);
})
