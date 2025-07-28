import * as crypto from "crypto";
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import ConnectionRequest from "../models/connection.model.js";
import Comment from "../models/comments.model.js";
import Post from "../models/post.model.js";


import bcrypt from "bcrypt"
import PDFDocument from "pdfkit";
console.log("PDFDocument type:", typeof PDFDocument, PDFDocument);
import fs from "fs";
import path from "path";
import express from "express";

//directory path

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// app.use('/uploads', express.static('uploads'));
app.use("/uploads", express.static(path.resolve("backend/uploads")));

// Defensive fix for convertUserDataTOPDF
const convertUserDataTOPDF = async(userData) =>{
    const doc = new PDFDocument();
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    const outPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const pdfPath = path.join(uploadDir, outPath);
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    try {
        if (!userData || !userData.userId) {
            throw new Error("User profile or user data not found.");
        }
        // Handle default profile picture path
        let profilePicPath;
        if (!userData.userId.profilePicture || userData.userId.profilePicture === "default.jpg") {
            profilePicPath = path.join(__dirname, "../uploads/default.jpg");
            if (!fs.existsSync(profilePicPath)) {
                console.warn('Default profile picture missing:', profilePicPath);
                profilePicPath = undefined; // Don't add image if missing
            }
        } else {
            profilePicPath = path.join(__dirname, "../uploads", userData.userId.profilePicture);
            if (!fs.existsSync(profilePicPath)) {
                console.warn('User profile picture missing:', profilePicPath);
                profilePicPath = undefined;
            }
        }
        if (profilePicPath) {
            try {
                doc.image(profilePicPath, { align: "center", width: 100 });
            } catch (imgErr) {
                console.error('Error adding image to PDF:', imgErr);
            }
        }
        doc.fontSize(14).text(`Name: ${userData.userId.name || ''}`);
        doc.fontSize(14).text(`Username: ${userData.userId.username || ''}`);
        doc.fontSize(14).text(`Email: ${userData.userId.email || ''}`);
        doc.fontSize(14).text(`Bio: ${userData.userId.bio || ''}`);   
        doc.fontSize(14).text(`Current Position: ${userData.currentPosition || ''}`);
        doc.fontSize(14).text("Past Work: ");
        (Array.isArray(userData.pastWork) ? userData.pastWork : []).forEach((work, index) => {
            doc.fontSize(14).text(`Company Name: ${work.companyName || ''}`);
            doc.fontSize(14).text(`Position: ${work.position || ''}`);
            doc.fontSize(14).text(`Years: ${work.years || ''}`);
        });
        doc.end();
    } catch (err) {
        console.error('Error during PDF generation:', err, '\nUserData:', JSON.stringify(userData, null, 2));
        doc.text('Error generating PDF.');
        doc.end();
        throw err;
    }
    return new Promise((resolve, reject) => {
        stream.on('finish', () => {
            console.log('PDF file written:', pdfPath);
            resolve(outPath);
        });
        stream.on('error', (err) => {
            console.error('PDF stream error:', err);
            reject(err);
        });
    });
}

export const register = async (req, res) =>{
    try{

        const { name, email, password, username } = req.body;

        if( !name || !email || !password || !username) return res. status(400).json ({ message: "Allfields are required"})

        const user = await User.findOne({ email});

        if(user) return res.status(400).json({ message: "User already exist"})

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            name
        });

        // await newUser.save();
        await newUser.save();
        // console.log("User created with ID:", newUser._id);
        console.log("User created with ID:", newUser._id.toString());

        // Create profile for the new user
        let profile;
        try {
            profile = new Profile({ userId: newUser._id });
            await profile.save();
            console.log("Profile created for user:", newUser._id);
        } catch (profileError) {
            console.error("Profile creation failed:", profileError);
        }

        return res.json({ 
            message: "User Created",
            userId: newUser._id,
            profileId: profile ? profile._id : null
        })

    } catch (error){
        console.error("Registration error:", error);
        return res.status(500).json ({ message: error.message})
    }

}

export const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if( !email || ! password ) 
            return res.status(400).json({ message: "All fields are required" })
        const user = await User.findOne({ email: req.body.email });

        if( !user) 
            return res.status(404).json({ message: "User does not exist"})
        
        const isMatch = await bcrypt.compare(password, user.password);
        if( !isMatch){ 
            console.log("Password mismatch");
            return res.status(400).json({ message: "Invalid Credential"})
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.token = token;
        await user.save();

        // const profile = new Profile({ userId: newUser._id });
        // await profile.save();

        
        return res.json({
            success: true,
            message: "Login successful",
            token,
            user:{
                name:user.name,
                email:user.email,
                username:user.username
            }
        });
        
    } catch (error){
        return res.status(500).json({ message: error.message });
    }
};

export const uploadProfilePicture = async(req, res) =>{
    const{ token } = req.body;
    try{
        const user = await User.findOne({token: token});
        if(!user){
            return res.status(404).json({ message: "User not found"})
        }
        user.profilePicture = req.file.filename;
        await user.save();
        // const profile = new Profile({ userId: newUser._id });
        // await profile.save(); 
        return res.status(200).json({ message: "Profile picture uploaded successfully!" });
    } catch(error){
        return res.status(500).json({ message: error.message })
    }  
}  

export const updateUserProfile = async (req, res) =>{
    try{
        const { token, ...newUserData } = req.body;
        const user = await User.findOne ({ token: token });

        if(!user){
            return res.status(404).json({ message: "User not found"})
        }

        const profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        Object.assign(profile, newUserData);
        await profile.save();
        return res.json({ message: "Profile Updated" })
    } catch (error){
        return res.status(500).json({ message: error.message})
    }
}

export const getUserAndProfile = async (req,res)=>{

    try{
        const { token } = req.body;

        console.log(`Token received: ${token}`)
        console.log(`Request body:`, req.body)

        if(!token) {
            return res.status(400).json({ message: "Token is required" })
        }

        const user = await User.findOne({ token: token});

        console.log(`User found:`, user ? "Yes" : "No")

        if(!user) {
            return res.status(400).json({ message: "User not found"})
        }
        if (!user || !user.token) {
            return res.status(400).json({ message: "User token is missing" });
        }
        const userProfile = await Profile.findOne({ userId: user._id })
            .populate("userId", "name email username profilePicture");
        // Always return as { profile: userProfile }
        return res.json({ profile: userProfile });

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const updateProfileData = async (req, res) =>{
    try{
        const { token, ...newProfileData } = req.body;
        const userProfile  = await User.findOne({ token: token});
        if(!userProfile){
            return res.status(404).json({ message: "User not found"})
        }
        const profile_to_update = await Profile.findOne({ userId: userProfile._id});
        
        Object.assign(profile_to_update, newProfileData);
        await profile_to_update.save();
        return res.json({ message: "Profile updated successfully"})
    } catch (error){
        return res.status(500).json({ message: error.message})
    }
}







// Add new function to check all profiles
export const getAllUserProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find().populate("userId", "name username email profilePicture");
        return res.json({ profiles });
            
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const downloadProfile = async (req, res) => {
    try {
        const user_id = req.query.id;
        const userProfile = await Profile.findOne({ userId: user_id })
            .populate('userId', 'name username email profilePicture');

        // Defensive checks and logging
        if (!userProfile) {
            console.error('No userProfile found for userId:', user_id);
            return res.status(404).json({ message: "user profile not found" });
        }
        if (!userProfile.userId) {
            console.error('userProfile.userId missing:', userProfile);
            return res.status(500).json({ message: "User data incomplete in profile." });
        }
        if (!Array.isArray(userProfile.pastWork)) {
            console.warn('userProfile.pastWork missing or not array, defaulting to empty array.');
            userProfile.pastWork = [];
        }
        console.log('userProfile:', userProfile);
        let outputPath;
        try {
            outputPath = await convertUserDataTOPDF(userProfile);
        } catch (err) {
            console.error('PDF generation failed:', err, '\nUserProfile:', JSON.stringify(userProfile, null, 2));
            return res.status(500).json({ message: `Failed to generate PDF: ${err.message}` });
        }
        const filePath = path.join(__dirname, "../uploads", outputPath);
        return res.download(filePath, "profile.pdf");
    } catch(error) {
        return res.status(500).json({ message: error.message });
    }
};

export const sendConnectionRequest = async (req, res) =>{
    const { token, connectionId} = req.body;


    try{
       
        const user = await User.findOne({ token});

        if(!user){
            return res.status(400).json({ message: "User not found"});
        }
        const connectionUser = await User.findOne({ _id: connectionId});

        if(!connectionUser){
            return res.status(400).json({ message: "Connection user not found"});
        }

        const existingRequest = await ConnectionRequest.findOne(
            { 
                userId: user._id, 
                connectionId: connectionUser._id
            }
        );

        if(existingRequest){
            return res.status(400).json({ message: "Connection request already sent"});
        }

        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id
        });

        await request.save();

        return res.status(200).json({ message: "Connection request sent successfully"});
        
    } catch (error){
         return res.status(500).json({message : error.message})

    }
}


export const getMyConnectionsRequests = async (req, res) =>{
    const { token } = req.body;
    try{
        const user = await User.findOne({ token});
        
        if(!user){
            return res.status(400).json({ message: "User not found"});
        }

        const connections = await ConnectionRequest.find({ userId: user._id})
            .populate("connectionId", "name username email profilePicture");

        return res.json({ connections});
    } catch (error){
        return res.status(500).json({ message: error.message})
    }
}

export const whatAreMyConnections = async (req, res) =>{
    const { token } = req.query;
    try{
        const user = await User.findOne({ token});
        
        if(!user){
            return res.status(400).json({ message: "User not found"})
        }
        const connections = await ConnectionRequest.find({ connectionId: user._id})
            .populate("userId", "name username email profilePicture");

        return res.json({ connections});


    }  catch(error){
        return res.status(500).json({ message: error.message})
    }
}

export const acceptConnectionRequest = async (req,res) =>{
    const{ token, requestId, action_type } = req.body;

    try{
        const user = await User.findOne({token});
        if(!user){
            return res.status(404).json({ message: "User not found"})
        }
        const connection = await ConnectionRequest.findOne({_id: requestId });
        if(!connection){
            return res.status(404).json({ message: "Connection not found"})
        }
        if(action_type === "accept"){
            connection.status_accepted = true;
        }else{
            connection.status_accepted =false;
        }

        await connection.save();
        return res.json({ message: "Request Updated"})
    } catch (error){
        return res.status(404).json({message: error.message})
    }
}


//how to comment on post

export const commentPost = async (req, res) =>{
    const { token, postId, commentBody} = req.body;
    try{
        console.log("Comment request received:", { token, postId, commentBody });
        
        const user = await User.findOne({ token: token});
        if(!user){
            return res.status(404).json({ message: "User not found"})
        }

        const post =  await Post.findOne({
            _id: postId
        });
        if(!post){
            return res.status(404).json({ message: "Post not found"})
        }

        const comment = new Comment({
            userId: user._id,
            postId: post._id,
            body: commentBody
        });

        console.log("Saving comment:", comment);
        await comment.save();
        console.log("Comment saved successfully");
        return res.status(200).json({ message: "Comment added successfully"})

    } catch (error){
        console.error("Comment error:", error);
        return res.status(500).json({ message: error.message})
    }
}

//get comment
//here we have not passing token coz commnets are readable by all

export const get_commnet_by_post = async (req, res) =>{
    const { postId } = req.body;
    try{
        const post = await Post.findOne({ _id: postId})
        
        if(!post){
            return res.status(404).json({ message: "Post not found"})
        }
        
        const comments = await Comment.find({ postId: postId })
            .populate("userId", "name username email profilePicture");
            
        return res.json({ comments: comments})
    } catch (error){
        return res.status(500).json({ message: error.message})

    }
}

export const getUserProfileAndUserBasedOnUsername = async (req, res) =>{
    const { username } = req.method === 'GET' ? req.query : req.body;
    try{
        const user = await User.findOne({ username});
        if(!user){
            return res.status(404).json({ message: "User not found"})
        }
        const userProfile = await Profile.findOne({ userId: user._id})
            .populate('userId', 'name username email profilePicture')
       
        return res.json({ user, userProfile})

    } catch (error){
        return res.status(404).json({ message: "User not found"})
    } 
}


//how to delete comment
export const delete_Comment_of_user = async (req, res) =>{
    const { token, comment_id} = req.body;
    try{
        const user = await User
    
            .findOne({ token: token})
            .select("_id");
        if(!user){
            return res.status(404).json({ message: "User not found"})
        }

        const comment = await Comment.findOne({ _id: comment_id})

        if(!comment){
            return res.status(404).json({ message: "Comment not found"})
        }

        if(comment.userId.toString() !== user._id.toString()){
            return res.status(401).json({ message: "Unauthorized"})
        }

        await Comment.deleteOne({ _id: comment_id});
        return res.json({ message: "Comment deleted successfully"})
        
    } catch (error){
        return res.status(500).json({ message: error.message})
    }
}










// Add function to create profile for existing user
export const createProfileForUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if profile already exists
        const existingProfile = await Profile.findOne({ userId: userId });
        if (existingProfile) {
            return res.status(400).json({ message: "Profile already exists for this user" });
        }

        // Create new profile
        const profile = new Profile({ userId: userId });
        await profile.save();
        
        console.log("Profile created for user:", userId);
        
        return res.json({ 
            message: "Profile created successfully",
            profileId: profile._id,
            userId: userId
        });
    } catch (error) {
        console.error("Profile creation error:", error);
        return res.status(500).json({ message: error.message });
    }
}