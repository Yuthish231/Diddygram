const { name } = require('ejs');
const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost:27017/miniProject`)

const userSchema=mongoose.Schema({
    username:String,
    name:String,
    age:Number,
    email:String,
    password:String,
    posts:[
        {type:mongoose.Schema.Types.ObjectId,
            ref:'posts'
        }
    ],
    profilepic:{
        type:String,
        default:'default.jpg'
    }

})

module.exports=mongoose.model("users",userSchema)