import { Router } from "express";
import { activeCheck, createPost, getAllPosts, deletePost, increment_likes } from "../controllers/posts.controller.js";
import { commentPost, get_commnet_by_post, delete_Comment_of_user } from "../controllers/user.controller.js";
import multer from "multer";


const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "uploads/")
    },
    filename: (req,file, cb)=>{
        cb(null, file.originalname)
    },
})
    
const upload = multer({ storage: storage})

router.route('/').get(activeCheck)

router.route("/post").post(upload.single("media"), createPost)
router.route("/post").get(getAllPosts)
router.route("/delete_post").delete(deletePost)
router.route("/comment").post(commentPost)
router.route("/get_comments").post(get_commnet_by_post)
router.route("/delete_comment").post(delete_Comment_of_user)
router.route("/increment_post_likes").post(increment_likes)

export default router;