const express = require('express');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const upload = require('./config/multer');
const rateLimit = require("express-rate-limit");
const app = express();
const PORT = process.env.PORT;

// Middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
    res.redirect("/create");
});

app.get("/create", (req, res) => {
    res.render("create");
});

// Apply routes
app.use(authRoutes);  // Auth routes (login, register)
app.use(userRoutes);  // User routes (homepage, profile)
app.use(postRoutes);  // Post routes (create, like, update, etc.)

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
