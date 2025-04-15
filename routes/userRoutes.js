// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const { isLoggedIn } = require('../middleware/authMiddleware');
const upload = require('../config/multer');  // Assuming you have multer configured for file uploads

// Home page route
router.get("/homepage", isLoggedIn, async (req, res) => {
    console.log(req.user);
    let user = await userModel.findOne({ email: req.user.email });
    res.render("homepage", { user });
});

// Profile route
router.get("/profile", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate("posts");
    res.render("profile", { user });
});

// Update profile picture route
router.post("/updateDP", upload.single('dp'), isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/homepage");
});

module.exports = router;
