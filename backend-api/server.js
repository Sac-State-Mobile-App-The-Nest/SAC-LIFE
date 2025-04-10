const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { poolPromise } = require('./db'); // Use the shared db module

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());
app.use(bodyParser.json());

const studentsRoute = require('./routes/students')(poolPromise);
const campus_servicesRoute = require('./routes/campus_services')(poolPromise);
const tagsRoute = require('./routes/tags');
const login_infoRoute = require('./routes/login_info');
const adminLoginRoute = require('./routes/admin_routes/admin_login')(poolPromise);
const adminRoutes = require('./routes/admin_routes/adminRoutes')(poolPromise);
const eventRoute = require('./routes/events')(poolPromise);
const signUpRoute = require('./routes/signup');
const notificationRoutes = require('./routes/notifications'); 


app.use('/api/students', studentsRoute);
app.use('/api/campus_services', campus_servicesRoute);
app.use('/api/tags', tagsRoute);
app.use('/api/login_info', login_infoRoute);
app.use('/api', adminLoginRoute);
app.use('/api/adminRoutes', adminRoutes);
app.use('/api/events', eventRoute);
app.use('/signup', signUpRoute);
app.use('/api/notifications', notificationRoutes);

app.get('/api/helloMessage', (req, res) => {
    res.send('Hello from Node.js backend!');
});

const port = process.env.PORT || 8080;

// Only start the server if this file is executed directly
if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
}

// Export app for testing
module.exports = app;