
import { Router } from "express";
import { register, login, uploadProfilePicture, getUserAndProfile, getAllUserProfiles, createProfileForUser, 
    downloadProfile, sendConnectionRequest, getMyConnectionsRequests, whatAreMyConnections, 
    acceptConnectionRequest, updateUserProfile, getUserProfileAndUserBasedOnUsername} from "../controllers/user.controller.js";

import multer from "multer";
import path from "path";

const router = Router();


router.get("/test", (req, res) => {
  res.send("Test working!");
});


  
const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, path.resolve("backend/uploads"));
    },
    filename: (req, file, cb)=>{
        cb(null, file.originalname)
    },
});


const upload = multer({storage: storage}); 


router.post("/register", register);
router.post("/login", login);
router.post("/update_profile_picture", upload.single("profile_picture"), uploadProfilePicture);
router.post("/user_update", updateUserProfile); 
router.post("/get_user_and_profile", getUserAndProfile);
router.get("/user/download_resume", downloadProfile);
router.post("/user/send_connection_request", sendConnectionRequest);
router.get("/user/getConnectionRequests", getMyConnectionsRequests);
router.get("/user/user_Connections_request", whatAreMyConnections);
router.post("/user/accept_connection_request", acceptConnectionRequest);
router.post("/user/get_user_profile_and_user_based_on_username", getUserProfileAndUserBasedOnUsername);
router.get("/user/get_profile_based_on_username", getUserProfileAndUserBasedOnUsername);
router.get("/get_all_profiles", getAllUserProfiles);
router.post("/create_profile_for_user", createProfileForUser);

// router.post("/update_profile_picture")
//     .post(upload.single("profile_picture"), uploadProfilePicture)

// router.post("/register").post(register);
// router.post("/login").post(login);
// router.route("/user_update").post(updateUserProfile);

export default router;