const express = require('express');
const sql = require("mssql");
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 5000;
const config = require('./config'); // server config file
const { authenticateToken, verifyRole } = require('./middleware/authMiddleware'); // Ensure correct path


require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());
app.use(bodyParser.json());

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
const login_infoRoute = require('./routes/login_info');
const adminLoginRoute = require('./routes/admin_routes/admin_login')(poolPromise);
const adminRoutes = require('./routes/admin_routes/adminRoutes')(poolPromise);
const eventRoute = require('./routes/events')(poolPromise);
const notificationRoutes = require('./routes/notifications'); 

app.use('/api/students', studentsRoute);
app.use('/api/campus_services', campus_servicesRoute);
app.use('/api/tags', tagsRoute);
app.use('/api/login_info', login_infoRoute);
app.use('/api', adminLoginRoute);
app.use('/api/adminRoutes', adminRoutes);
app.use('/api/events', eventRoute);
app.use('/api/notifications', notificationRoutes);


app.get('/api/helloMessage', (req, res) => {
    res.send('Hello from Node.js backend!');
});

// Only start the server if this file is executed directly
if (require.main === module) {
  app.listen(port, () => {
      console.log(`Server running on port http://localhost:${port}`);
  });
}

// Export app for testing
module.exports = app;