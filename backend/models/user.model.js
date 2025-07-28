import mongoose, { Schema } from "mongoose";
// import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    
    username: {
        type:String,
        required: true,
        unique: true
    },
    name: {
        type:String,
        required: true,
    },
    email: {
        type:String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    token:{  
        type:String,
        default: " "
    },
    profilePicture:{
        type: String,
        default: "default.jpg"
    }    
});

const user = mongoose.model("User", UserSchema)

export default user;