const express = require('express');
const router = express.Router();
const postModel = require('../models/post');
const userModel = require('../models/user');
const { isLoggedIn } = require('../middleware/authMiddleware');
const logActivity = require('../logger');

// Post creation route
router.post("/post", isLoggedIn, async (req, res) => {
    const { postDesc, image } = req.body;
    let user = await userModel.findOne({ email: req.user.email });
    let post = await postModel.create({ userId: user._id, postDesc: postDesc, postImage: image });
    user.posts.push(post._id);
    await user.save();
    await logActivity(`User ${user.email} created a post with ID ${post._id}`);
    res.redirect("/profile");
});

// Like a post
router.get("/like/:id", isLoggedIn, async (req, res) => {
    let postid = req.params.id;
    let post = await postModel.findOne({ _id: postid }).populate("userID");

    let action = '';
    if (post.Likes.indexOf(req.user.userid) === -1) {
        post.Likes.push(req.user.userid);
        action = 'liked';
    } else {
        post.Likes.pull(req.user.userid);
        action = 'unliked';
    }

    await post.save();
    await logActivity(`User ${req.user.email} ${action} post ID ${postid}`);
    res.redirect("/profile");
});

// Edit post view
router.get("/edit/:id", isLoggedIn, async (req, res) => {
    let postid = req.params.id;
    let post = await postModel.findOne({ _id: postid }).populate("userID");
    res.render("edit", { post });
});

// Update post
router.post("/update/:id", isLoggedIn, async (req, res) => {
    let postid = req.params.id;
    const { postDesc, postImage } = req.body;
    await postModel.findOneAndUpdate({ _id: postid }, { postDesc, postImage });
    await logActivity(`User ${req.user.email} updated post ID ${postid}`);
    res.redirect("/profile");
});

// Delete post
router.post("/delete/:id", isLoggedIn, async (req, res) => {
    await postModel.findByIdAndDelete(req.params.id);
    await logActivity(`User ${req.user.email} deleted post ID ${req.params.id}`);
    res.redirect("/profile");
});

module.exports = router;
