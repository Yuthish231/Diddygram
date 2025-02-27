const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const userModel=require('./models/user')
const bcrypt = require('bcrypt');
const user = require('./models/user');
const postModel = require('./models/post');
const app=express()

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.get("/create",(req,res)=>{
    res.render("create")
})

app.post("/register",async (req,res)=>{
    let {name,username,email,age,password}=req.body
    let exist=await userModel.findOne({email:email})
    if (exist){
        return res.status(500).send("User already registered")
    }
    bcrypt.genSalt(10,async (err,salt)=>{
        let hashedPassword= await bcrypt.hash(password,salt)
        let user =await userModel.create({
            name,
            username,
            email,
            password:hashedPassword,
            age
        })
        console.log(`Created User ${user}`)
    })
    const token= jwt.sign({email:email,userid:user._id},"suppasecretdiddy")
    res.cookie("token",token)
    res.redirect("/homepage")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/login",async (req,res)=>{
    const {username,password}=req.body
    let user= await userModel.findOne({username:username})
    if (!user) return res.status(500).send("Something went wrong user")
    const validate=await bcrypt.compare(password,user.password)
    if (!validate) return res.status(500).send("Something went wrong Pass")

    let token=jwt.sign({username:username,email:user.email,userid:user._id},"suppasecretdiddy")
    res.cookie("token",token)
    res.redirect("/homepage")

})

app.get("/homepage",isLoggedIn,(req,res)=>{ //2nd parameter is a middleware function
    console.log(req.user)
    res.render("homepage")
})

app.get("/logout",(req,res)=>{
    res.clearCookie("token")
    res.redirect("/login")
})

app.get("/profile",isLoggedIn,async (req,res)=>{
    let user= await userModel.findOne({email:req.user.email}).populate("posts") // this is used to replace the object id with the actual data that is referenced....
    res.render("profile",{user})
})

app.post("/post",isLoggedIn,async (req,res)=>{
    const {postDesc,image}=req.body
    let user=await userModel.findOne({email:req.user.email})
    let post= await postModel.create({userId:user._id,postDesc:postDesc,postImage:image})
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
})

app.get("/like/:id",isLoggedIn,async (req,res)=>{
    let postid=req.params.id
    let post=await postModel.findOne({_id:postid}).populate("userID")
    if (post.Likes.indexOf(req.user.userid)===-1){
        post.Likes.push(req.user.userid)
    }
    else{
        post.Likes.pull(req.user.userid)
    }
    
    await post.save()
    res.redirect("/profile")
})

app.get("/edit/:id",isLoggedIn,async (req,res)=>{
    let postid=req.params.id
    let post=await postModel.findOne({_id:postid}).populate("userID")
    res.render("edit",{post})
})

app.post("/update/:id",isLoggedIn,async (req,res)=>{
    let postid=req.params.id
    const {postDesc,postImage}=req.body
    let post=await postModel.findOneAndUpdate({_id:postid},{postDesc,postImage})
    res.redirect("/profile")
})

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/login");  
    }
    try {
        const data = jwt.verify(token, "suppasecretdiddy");
        req.user = data; 
        next()
    } catch (error) {
        console.error(error);
        return res.redirect("/login");
    }
}



app.listen(3000,()=>{
    console.log('server is running on port 3000');
})