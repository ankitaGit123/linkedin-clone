import mongoose from "mongoose";

// Education sub-schema
const educationSchema = new mongoose.Schema({
    school: {
        type: String,
        default: " "
    },
    degree: {
        type: String,
        default: " "
    },
    fieldOfStudy: {
        type: String,
        default: " "
    }
});

// Past work sub-schema
const workSchema = new mongoose.Schema({
    company: {
        type: String,
        default: " "
    },
    position: {
        type: String,
        default: " "
    },
    years: {
        type: String,
        default: " "
    }
});

// Main Profile schema
const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bio: {
        type: String,
        default: " "
    },
    currentPost: {
        type: String,
        default: " "
    },
    pastWork: {
        type: [workSchema],
        default: []
    },
    education: {
        type: [educationSchema],
        default: [],
    }
});

const Profile = mongoose.model("Profile", ProfileSchema);

export default Profile;