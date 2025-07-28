// Test script to check profiles in MongoDB
import mongoose from "mongoose";
import Profile from "./models/profile.model.js";
import User from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env"});

const testProfiles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Check all users
        const users = await User.find({});
        console.log("Total users:", users.length);
        users.forEach(user => {
            console.log(`User: ${user.name} (${user.email}) - ID: ${user._id}`);
        });

        // Check all profiles
        const profiles = await Profile.find({}).populate("userId", "name email");
        console.log("\nTotal profiles:", profiles.length);
        profiles.forEach(profile => {
            console.log(`Profile ID: ${profile._id} - User: ${profile.userId?.name || 'No user'} (${profile.userId?.email || 'No email'})`);
        });

        // Check for users without profiles
        const usersWithoutProfiles = [];
        for (const user of users) {
            const profile = await Profile.findOne({ userId: user._id });
            if (!profile) {
                usersWithoutProfiles.push(user);
            }
        }

        console.log("\nUsers without profiles:", usersWithoutProfiles.length);
        usersWithoutProfiles.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
        });

        // Create profiles for users who don't have them
        for (const user of usersWithoutProfiles) {
            const newProfile = new Profile({ userId: user._id });
            await newProfile.save();
            console.log(`Created profile for user: ${user.name}`);
        }

        console.log("\nTest completed!");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

testProfiles(); 