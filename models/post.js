const mongoose = require('mongoose');

let postSchema=mongoose.Schema({
    postDesc:String,
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    postImage:String,
    Likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users'
        }
    ],
    postDate:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model("posts",postSchema)