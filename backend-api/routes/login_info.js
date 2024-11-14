const express = require('express');
const router = express.Router();
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Replace this key with an environment variable so it's not just in the code...
// Key was obtained by running in the terminal:
// > node
// > require('crypto').randomBytes(64).toString('hex')
const JWT_SECRET_TOKEN = 'eea7a9c77a0ee1b50710563929964c15631e1e898871c90fe32784c5e9b925fc882554a81e3695d5cd3a919a6203a31c4371ad82c920a5257f03db3d635f0301';
const JWT_REFRESH_TOKEN = 'c8ee858d844fe98367a533e7320967c10d76d4a14122b7b584244505ad560c0fa7a7433dd94b38aaf158d04c317fcdd4ca7c10b18701881b80cd0f17edb27151';


// Get request for the whole login_info table from SQL
router.get('/', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM login_info');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error');
    }
})

// Testing function with bcrypt hashing
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let userInputPassword = password;

    try {
        const request = new sql.Request();

        request.input('username', sql.VarChar, username);
        request.input('password', sql.VarChar, password);

        // Checks if the username and password input match any fields in the database
        const result = await request.query('SELECT * FROM login_info WHERE username = @username');

        // Get the hashed password from the database result
        const storedHashedPassword = result.recordset[0].hashed_pwd;

        // If there are no matches, recordset.length will be 0
        if (result.recordset.length == 0) {
            res.send('Login failed.')
            
        } else {    // If the user exists, compare input password with the corresponding hashed password in the database

            // Function call to compare password
            bcrypt.compare(userInputPassword, storedHashedPassword, (err, result) => {
                // Error handler
                if (err) {
                    console.log("An error occured comparing passwords.", err);
                    console.log("Data type: ", typeof userInputPassword)
                    console.log(err.message + " " + err.name);
                    return;
                }
    
                if (result) {
                    // Passwords match, authentication successful
                    // res.send('Passwords match! User authenticated.');
                    console.log('Passwords match! User authenticated.');

                    // Create JWT after authenticating the user
                    const accessToken = jwt.sign(username, JWT_SECRET_TOKEN);
                    res.json({ accessToken });
                } else {
                    // Passwords don't match, authentication failed
                    res.send('Passwords do not match! Authentication failed.');
                    console.log('Passwords do not match! Authentication failed.');
                }
            })
        }

    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server Error.');
    }
})



// Get request to hash a password
// Call in Postman with: localhost:5000/api/login_info/login/hasher
router.get('/hasher', async (req, res) => {
    // Replace the samplePass with whatever password you want to encrypt
    const samplePass = 'password123';

    try {
        // Generate salt with 10 rounds
        const salt = await bcrypt.genSalt(10);

        // Hash the password with the generated salt
        const hash = await bcrypt.hash(samplePass, salt);

        // Send the hashed password as a response
        res.send({ hashedPassword: hash });

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Server Error.');
    }
});

module.exports = router;


// Navigate to the 'backend-api' folder and then run:
// npm install bcryptjs jsonwebtoken

// For testing logins with new hash logic:
// This is the only sample account with a hashed password (Plaintext password is: password123)
// "std_id": 4,
// "username": "user4",
// "hashed_pwd": "$2a$10$vFAmld52ZZsWtv7ntShnFOThdlrMMt.RpkJmWP8.SDMUOFFkseRIa",
// "first_login": false
// 

// Password hashing function
        // bcrypt.hash(userPassword, salt, (err, hash) => {
        //     if (err) {
        //         console.log("Password hash failed.")
        //         return;
        //     }

        //     // Hashing successful, 'hash' holds the hashed password
        //     console.log('Hashed password: ', hash);
        // });