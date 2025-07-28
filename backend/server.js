import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/posts.routes.js";


dotenv.config({ path: "../.env"}); // Load environment variables

const app = express();
app.use(cors());


app.use(express.json());  //to parse incoming JSON

const __dirname = path.resolve(); // Add this if using ES modules
app.use("/uploads", express.static(path.join(__dirname, "backend/uploads")));
console.log("Static file serving enabled for /uploads");
app.use("/", userRoutes);  // optional: use prefix like /api

app.get("/", (req, res) => {
  res.send("LinkedIn Clone Backend Running!");
});

app.use("/posts", postRoutes); 


const start = async () => {
  try {
    // await mongoose.connect("mongodb+srv://ankita:Ankita%40123@linkedinclone.nzksvgy.mongodb.net/");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(9090, () => {  
      console.log("Server is running on port 9090");
    });
  } catch (error) {
    console.error(" DB connection failed:", error.message);   
  }
}
start();    

  