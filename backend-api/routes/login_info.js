const express = require('express');
const router = express.Router();
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { authenticateToken } = require('../middleware/studentAuthMiddleware')
const JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN;

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
        const loginQuery = await request.query('SELECT * FROM login_info WHERE username = @username');
        request.input('std_id', sql.Int, loginQuery.recordset[0].std_id);
        const emailVerifyQuery = await request.query('SELECT is_email_verified, email FROM test_students WHERE std_id = @std_id');

        // If there are no matches, recordset.length will be 0
        if (loginQuery.recordset.length == 0) {
            res.send('Login failed.')
        } else {
            //check if the user account is inactive, return
            console.log(loginQuery.recordset[0].is_active);
            if (loginQuery.recordset[0].is_active === false){
                return res.status(403).json({message: "Account Inactive"});
            }
            // check if email is verified. adds the email to send to verification screen
            if (emailVerifyQuery.recordset[0].is_email_verified === false){
                return res.status(403).json({message: "Account Not Verified", email: emailVerifyQuery.recordset[0].email});
            }
            // If the user exists, compare input password with the corresponding hashed password in the database
            // Get the hashed password from the database result
            const storedHashedPassword = loginQuery.recordset[0].hashed_pwd;
            // Function call to compare password
            bcrypt.compare(userInputPassword, storedHashedPassword, async (err, result) => {
                // Error handler
                if (err) {
                    console.log("An error occured comparing passwords.", err);
                    console.log("Data type: ", typeof userInputPassword)
                    console.log(err.message + " " + err.name);
                    return;
                }
    
                if (result) {
                    // Passwords match, authentication successful
                    console.log('Passwords match! User authenticated.');

                    // Create JWT after authenticating the user
                    const user = loginQuery.recordset[0];
                    // added student data (email, is_email_verified) with the login info
                    const accessToken = jwt.sign({...loginQuery.recordset[0], ...emailVerifyQuery.recordset[0]}, JWT_SECRET_TOKEN);

                    //log the successful login for analytics
                    await request.query('INSERT INTO login_logs DEFAULT VALUES;');
                    res.status(200).json({ 
                        accessToken: accessToken, 
                        userId: user.std_id 
                    });
                } else {
                    // Passwords don't match, authentication failed
                    return res.status(403).json({ message: 'Incorrect username or password.' });
                }
            })
        }

    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server error.');
    }
})


router.get('/check-login-bool', authenticateToken, (req, res) => {
    const firstLogin = req.user.first_login;
    console.log(firstLogin);
    res.send(firstLogin);
});

// check if email is verified
router.get('/check-email-verify-bool', authenticateToken, (req, res) => {
    const is_email_verified = req.user.is_email_verified;
    console.log(is_email_verified);
    res.send(is_email_verified);
});

//updates the user password - takes in an old password and new password. Then checks if the new password(hashed) is in
//the database for that userid, if it isn't then it will update the password and return true
//otherwise doesn't update password and returns false
router.put('/updatePassword', authenticateToken, async (req, res) => {
    const std_id = req.user.std_id;
    const { oldPassword, newPassword } = req.body;//oldPassword is what the user typed, not actual oldPassword
    
    try{
        //get hashed password for user
        const request = new sql.Request();
        const result = await request
            .input('std_id', sql.Int, std_id)
            .query(`SELECT hashed_pwd FROM login_info WHERE std_id=@std_id`);
        if (result.recordset.length === 0){
            return res.status(404).json({ success: false, message: "User not found"});
        }
        const hashed_pwd = result.recordset[0].hashed_pwd;
        //console.log("Hashed Password:", hashed_pwd);

        //check if hash of oldPassword == to hashed_pwd, if it is then hash newPassword and change the database
        const oldAndNewMatch = await bcrypt.compare(oldPassword, hashed_pwd);
        if(!oldAndNewMatch){
            console.log("User inputted password does not match hashed_pwd in database");
            return res.json({ success: false, message: "Incorrect password"});
        }
        //hash the new password and update database
        const salt = await bcrypt.genSalt(10);
        const newHashedPwd = await bcrypt.hash(newPassword, salt);
        await request
            .input('hashed_pwd', sql.VarChar, newHashedPwd)
            .query(`UPDATE login_info SET hashed_pwd=@hashed_pwd WHERE std_id=@std_id`);
        return res.json({ success: true, message: "Password updated"});
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server error.');
    }
});

//student deactivates their account - sets is_active = 0
router.put('/deactivateAccount', authenticateToken, async (req, res) => {
    const std_id = req.user.std_id;
    try{
        //get the is_active
        const request = new sql.Request();
        await request
            .input('std_id', sql.Int, std_id)
            .query(`UPDATE login_info SET is_active = 0 WHERE std_id = @std_id`);
        
        //if is_active = false, return status deactivated: true
        const result = await request.query(`SELECT is_active FROM login_info WHERE std_id = @std_id`);
        if (!result.recordset[0].is_active){
            return res.json({ deactivated: true });
        } else {
            return res.json({ deactivated: false });
        }
    } catch (err) {
        console.error('SQL error', err);
        return res.status(500).send('Server error.');
    }
})

module.exports = router;