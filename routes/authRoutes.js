const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const logActivity = require('../logger'); // ✅ Import the logger
const router = express.Router();

// Render login page
router.get('/login', (req, res) => {
    res.render('login');  // Ensure you have a login.ejs file in your views folder
});

// Login POST route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Please provide both email and password.');
    }

    try {
        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid credentials');
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign({ email: user.email, userid: user._id }, process.env.JWT_SECRET);

        // Set token cookie
        res.cookie('token', token);
        res.redirect('/homepage');  // Redirect to homepage or your desired route after login

    } catch (err) {
        console.error(err);
        logActivity(`Error during login for ${email}: ${err.message}`);
        res.status(500).send("Internal Server Error");
    }
});

// Registration route
router.post("/register", async (req, res) => {
    const { name, username, email, age, password } = req.body;

    if (!email || !password || !name || !username || !age) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Check if user already exists
        let exist = await userModel.findOne({ email: email });
        if (exist) {
            await logActivity(`Registration failed for ${email} - User already exists`);
            return res.status(400).send("User already registered");
        }

        // Hash the password and create the user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        let user = await userModel.create({
            name,
            username,
            email,
            password: hashedPassword,
            age
        });

        await logActivity(`User registered: ${email}`);

        // Generate JWT token
        const token = jwt.sign({ email: email, userid: user._id }, process.env.JWT_SECRET);

        // Set token cookie
        res.cookie("token", token);
        res.redirect("/homepage");

    } catch (err) {
        console.error(err);
        await logActivity(`Error during registration for ${email}: ${err.message}`);
        res.status(500).send("Internal Server Error");
    }
});

// Logout route with POST
router.get('/logout', (req, res) => {
    res.clearCookie('token');  // Clear the authentication token
    res.redirect('/login');    // Redirect to the login page
});

module.exports = router;
