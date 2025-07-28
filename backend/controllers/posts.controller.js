import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comments.model.js";

import bcrypt from "bcrypt";

export const activeCheck = async (req,res) =>{
    return res.status(200).json({ message: "RUNNING"})


}

//creat post 
export const createPost = async(req,res)=>{
    const { token } = req.body;
    try{
        //usee exist or not
        const user = await User.findOne({ token :token});
        if(!user){
            return res.status(404).json({ message: "User not found"})
        }
        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file != undefined ? req.file.filename : "",
            fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
            active: true
        })

        await post.save();
        return res.status(200).json({ message: "Post created successfully"})
    
    } catch (error){
        return res.status(500).json({ message: error.message})
    }
}

export const getAllPosts = async (req, res) =>{
    try{
        const posts = await Post.find().populate("userId", "name username email profilePicture");
        return res.json({ posts});
    } catch (error){
        return res.status(500).json({ message: error.message})
    }
}

export const deletePost = async (req, res) =>{

    const { token, post_id} = req.body;
    try{
        const user = await User
            .findOne({ token: token})
            .select("_id");
        
        if(!user){
            return res.status(404).json({ message: "User not found"})
        }

        const post = await Post.findOne({ _id: post_id });
        if(!post){
            return res.status(404).json({ message: "Post not found"})
        }
        if(post.userId.toString() !== user._id.toString()){
            return res.status(401).json({ message: "Unauthorized"})
        }
        await Post.deleteOne({ _id: post_id});

        return res.json({ message: "Post deleted successfully"})

    } catch (error){
        return res.status(500).json({ message: error.message})
    }
}
 

export const get_comments_by_post = async (req, res) =>{
    const { postId } = req.body;

    console.log("postId", postId)
    try{
        const post = await Post.findOne({ _id: postId})
        
        if(!post){
            return res.status(404).json({ message: "Post not found"})
        }
        
        const comments = await Comment
            .find({ postId: postId })
            .populate("userId", "name username email profilePicture");
            
        return res.json( comments.reverse() )
    } catch (error){
        return res.status(500).json({ message: error.message})

    }
}

export const create_comment = async (req, res) =>{
    const { token, postId, commentBody } = req.body;
    
    try{
        const user = await User.findOne({ token: token });
        if(!user){
            return res.status(404).json({ message: "User not found"})
        }

        const post = await Post.findOne({ _id: postId });
        if(!post){
            return res.status(404).json({ message: "Post not found"})
        }

        const comment = new Comment({
            userId: user._id,
            postId: postId,
            body: commentBody
        });

        await comment.save();
        return res.json({ message: "Comment created successfully"})
    } catch (error){
        return res.status(500).json({ message: error.message})
    }
}



export const increment_likes = async (req, res) =>{
    const{postId} = req.body;
    try{
        const post = await Post.findOne({ _id: postId});
        if(!post){
            return res.status(404).json({ message: "Post not found"})
        }
        post.likes += 1;
        await post.save();

        return res.json({ message: "Likes incremented successfully"})

    } catch(error){
        return res.status(500).json({ message: error.message})
    }
}








// export const register = async (req, res) =>{
//     try{

//         const { name, email, password, username } = req.body;

//         if( !name || !email || !password || !usename) return res. status(400).json ({ message: "Allfields are required"})

//         const user = await User.findOne({
//             email
//         });

//         if(user) return res.status(400).json({ message: "User already exist"})

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new User({
//             name,
//             email,
//             password: hashedPassword,
//             username
//         });

//         await newUser.save();

//         const profile = new Profile({ userId: newUser._id});

//         return res.json({ message: "User Created"})

//     } catch (error){
//         return res.status(500).json ({ message: error.message})
//     }

// }

