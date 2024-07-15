const express = require('express');
const body_parser = require('body-parser');
const router = express.Router();
const pam = require('authenticate-pam');
router.use(body_parser.json());

router.get('/login', (req, res) => {
    const context = {
        error: null //[{ msg: null }]; // Replace this with your actual error handling logic
    }
    res.render('login', context);
});

router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    pam.authenticate(username, password, (err) => {
        if (err) {
            console.error(`Authentication failed for user ${username}:`, err);
            res.render('login', { error: 'Invalid username or password' });
        } else {
            req.session.user = username;
            req.session.access_level = 1; // Assign access level based on the username
            res.redirect('/dashboard');
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/login');
    });
});


module.exports = router;