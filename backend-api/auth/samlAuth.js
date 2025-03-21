const passport = require('passport');
const SamlStrategy = require('@node-saml/passport-saml').Strategy;
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// // Ensure `idpCert` is correctly loaded
// TODO: Needs to use environment variable
// const idpCert = `-----BEGIN CERTIFICATE-----
// MIIEYzCCAkugAwIBAgIDIAZm...
// -----END CERTIFICATE-----`;

// Ensure `idpCert` is correctly loaded
const idpCert = "-----BEGIN CERTIFICATE-----\nMIIEYzCCAkugAwIBAgIDIAZmMA0GCSqGSIb3DQEBCwUAMC4xCzAJBgNVBAYTAkRF\nMRIwEAYDVQQKDAlTU09DaXJjbGUxCzAJBgNVBAMMAkNBMB4XDTE2MDgwMzE1MDMy\nM1oXDTI2MDMwNDE1MDMyM1owPTELMAkGA1UEBhMCREUxEjAQBgNVBAoTCVNTT0Np\ncmNsZTEaMBgGA1UEAxMRaWRwLnNzb2NpcmNsZS5jb20wggEiMA0GCSqGSIb3DQEB\nAQUAA4IBDwAwggEKAoIBAQCAwWJyOYhYmWZF2TJvm1VyZccs3ZJ0TsNcoazr2pTW\ncY8WTRbIV9d06zYjngvWibyiylewGXcYONB106ZNUdNgrmFd5194Wsyx6bPvnjZE\nERny9LOfuwQaqDYeKhI6c+veXApnOfsY26u9Lqb9sga9JnCkUGRaoVrAVM3yfghv\n/Cg/QEg+I6SVES75tKdcLDTt/FwmAYDEBV8l52bcMDNF+JWtAuetI9/dWCBe9VTC\nasAr2Fxw1ZYTAiqGI9sW4kWS2ApedbqsgH3qqMlPA7tg9iKy8Yw/deEn0qQIx8Gl\nVnQFpDgzG9k+jwBoebAYfGvMcO/BDXD2pbWTN+DvbURlAgMBAAGjezB5MAkGA1Ud\nEwQCMAAwLAYJYIZIAYb4QgENBB8WHU9wZW5TU0wgR2VuZXJhdGVkIENlcnRpZmlj\nYXRlMB0GA1UdDgQWBBQhAmCewE7aonAvyJfjImCRZDtccTAfBgNVHSMEGDAWgBTA\n1nEA+0za6ppLItkOX5yEp8cQaTANBgkqhkiG9w0BAQsFAAOCAgEAAhC5/WsF9ztJ\nHgo+x9KV9bqVS0MmsgpG26yOAqFYwOSPmUuYmJmHgmKGjKrj1fdCINtzcBHFFBC1\nmaGJ33lMk2bM2THx22/O93f4RFnFab7t23jRFcF0amQUOsDvltfJw7XCal8JdgPU\ng6TNC4Fy9XYv0OAHc3oDp3vl1Yj8/1qBg6Rc39kehmD5v8SKYmpE7yFKxDF1ol9D\nKDG/LvClSvnuVP0b4BWdBAA9aJSFtdNGgEvpEUqGkJ1osLVqCMvSYsUtHmapaX3h\niM9RbX38jsSgsl44Rar5Ioc7KXOOZFGfEKyyUqucYpjWCOXJELAVAzp7XTvA2q55\nu31hO0w8Yx4uEQKlmxDuZmxpMz4EWARyjHSAuDKEW1RJvUr6+5uA9qeOKxLiKN1j\no6eWAcl6Wr9MreXR9kFpS6kHllfdVSrJES4ST0uh1Jp4EYgmiyMmFCbUpKXifpsN\nWCLDenE3hllF0+q3wIdu+4P82RIM71n7qVgnDnK29wnLhHDat9rkC62CIbonpkVY\nmnReX0jze+7twRanJOMCJ+lFg16BDvBcG8u0n/wIDkHHitBI7bU1k6c6DydLQ+69\nh8SCo6sO9YuD+/3xAGKad4ImZ6vTwlB4zDCpu6YgQWocWRXE+VkOb+RBfvP755PU\naLfL63AFVlpOnEpIio5++UjNJRuPuAA=\n-----END CERTIFICATE-----"

/* I don't think SSOCircle does signatures with SAML Assertions,
 * but we may need it in the future when our app does get hosted.
 * So ignore the 'signatureAlgorithm', 'wantAssertionsSigned', and
 * 'authnRequestBinding'
 */
const samlConfig = {
    entryPoint: process.env.SAML_ENTRY_POINT, 
    issuer: process.env.SAML_ISSUER, 
    callbackUrl: process.env.SAML_CALLBACK_URL, 
    idpCert: idpCert,  // TODO: Replace to use environment variable later
    signatureAlgorithm: 'sha256',  
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    authnRequestBinding: 'HTTP-POST',
    wantAssertionsSigned: false,  // SSOCircle does not sign assertions
    validateInResponseTo: 'never',   // Prevents validation errors due to missing signatures
    additionalParams: {
        SuccessString: "TestSSO123"  // Add this ONLY for SSO Check testing
    }
};

// Try-Catch to Catch `passport-saml` Issues
try {
    passport.use(new SamlStrategy(samlConfig, (profile, done) => {
        const user = {
            id: profile.nameID,
            email: profile.email || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            name: profile.displayName || profile.cn
        };
        return done(null, user);
    }));
    console.log("Passport SAML Strategy Initialized Successfully!");
} catch (error) {
    console.error("ERROR Initializing Passport-SAML:", error);
    process.exit(1);
}

// Define login function
const login = (req, res, next) => {
    
    passport.authenticate('saml', (err, user, info) => {
        if (err) {
            console.error("SAML Authentication Request Error:", err);
            return res.status(500).json({ message: "SAML request failed." });
        }
        console.log("🔍 SAML Authentication Request Sent.");
        console.log("🔍 SAML Request Details:", JSON.stringify(req.saml, null, 2));
        next();
    })(req, res, next);
};

// Define callback function
const callback = (req, res, next) => {
    console.log("Processing SAML callback...");
    passport.authenticate('saml', (err, user, info) => {
        if (err || !user) {
            console.error("SAML Authentication Failed:", err || info);
            return res.status(401).json({ message: "SAML Authentication Failed" });
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                console.error("Error during login:", loginErr);
                return res.status(500).json({ message: "Error during login." });
            }
            console.log("SAML Authentication Success:", user);
            return res.json({ message: "SAML Login Successful", user });
        });
    })(req, res, next);
};

module.exports = { login, callback, passport};