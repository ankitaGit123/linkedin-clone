// import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import { getAllPosts } from '../../config/redux/action/postAction'
// import { getConnectionsRequesst } from '../../config/redux/action/connectionAction'

// Create axios instance for API calls
const clientServer = axios.create({
    baseURL: "http://localhost:9090",
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAllPosts = createAsyncThunk(
    "post/getAllPosts",
    async (_, thunkAPI) =>{
        try {
            console.log("Making API call to:", clientServer.defaults.baseURL + '/posts/post');
            
            const response = await clientServer.get('/posts/post');

            console.log("API Response:", response.data);
            return thunkAPI.fulfillWithValue(response.data)


        } catch (error) {
            console.error("API Error:", error);
            console.error("Error Response:", error.response);
            
            // Check if it's a network error (backend not running)
            if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                return thunkAPI.rejectWithValue("Backend server is not running. Please start the server on port 9090.")
            }
            
            return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch posts")
        }
        
    }
)

export const createPost = createAsyncThunk(
    "post/createPost",
    async (userData, thunkAPI)=>{
        const { file, body } = userData;

        try {

            const formData = new FormData();
            formData.append("token", localStorage.getItem("token"));
            formData.append("body", body)
            formData.append("media", file)

            const response = await clientServer.post("/posts/post", formData, {
                headers:{
                    'content-type': 'multipart/form-data',
                }
            });

            if(response.status === 200){
                return thunkAPI.fulfillWithValue("Post Uploaded")

            } else {
                return thunkAPI.rejectWithValue("Post not uploaded")
            }
            
        } catch (error){
            return thunkAPI.rejectWithValue(error.response?.data || "Failed to upload post")
        }
   }
)

export const deletePost = createAsyncThunk(
    "post/deletePost",
    async (postData, thunkAPI) => {
        try {
            const response = await clientServer.delete("/posts/delete_post", {
                data: {
                    token: localStorage.getItem("token"),
                    post_id: postData.post_id
                }
            });
            return thunkAPI.fulfillWithValue(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue("Something went wrong")
        }
    }
)


export const incrementPostLike = createAsyncThunk(
    "post/incrementLike",
    async (postData, thunkAPI) => {
        try {
            const response = await clientServer.post(`/posts/increment_post_likes`, {
                postId: postData.post_id
            })

            return thunkAPI.fulfillWithValue(response.data)

        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message)

        }
    }
)


export const getAllComments = createAsyncThunk(
    "post/getAllComments",

    async (postData, thunkAPI) => {
        try {
            console.log("Fetching comments for post:", postData.post_id)
            const response = await clientServer.post(`/posts/get_comments`, {
                postId: postData.post_id
            });
            console.log("Comments fetched:", response.data.comments)
            return thunkAPI.fulfillWithValue({
                comments: response.data.comments,
                post_id: postData.post_id
            })
        } catch (error) {
            console.error("Error fetching comments:", error.response?.data)
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch comments")
        }
    }
)



export const postComment = createAsyncThunk(
    "post/postComment",
    async (commentData, thunkAPI) => {
        try {
            console.log("Posting comment with data:", {
                post_id: commentData.post_id,
                body: commentData.body
            })
            const response = await clientServer.post(`/posts/comment`, {
                token: localStorage.getItem("token"),
                postId: commentData.post_id,
                commentBody: commentData.body
            })
            console.log("Comment posted successfully:", response.data)
            return thunkAPI.fulfillWithValue(response.data)
        } catch (error) {
            console.error("Error posting comment:", error.response?.data)
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to post comment")
        }
    }
)