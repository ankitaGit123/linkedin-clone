import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Create axios instance for API calls
const clientServer = axios.create({
    baseURL: "http://localhost:9090",
    headers: {
        'Content-Type': 'application/json',
    },
});

export const loginUser = createAsyncThunk(
    "user/login",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post(`/login`, {
                email: user.email,
                password: user.password
            });

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                console.log("Token set in localStorage:", localStorage.getItem("token"));
                return response.data;
            } else {
                return thunkAPI.rejectWithValue({
                    message: "Token not provided"
                });
            }

        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || "Login failed");
        }
    }
);

export const registerUser = createAsyncThunk(
    "user/register",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/register", {
                username: user.username,
                password: user.password,
                email: user.email,
                name: user.name,
            });
            
            // if (response.data.token) {
            //     localStorage.setItem("token", response.data.token);
            // }

            return response.data;

        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const getAboutUser = createAsyncThunk(
    "user/getAboutUser",
    async (userData, thunkAPI) =>{
        try{
            // Handle both cases: when userData is { token } or when it's a user object
            const token = userData.token || userData;
            console.log("Getting user data with token:", token)
            console.log("User data:", userData)
            
            if (!token) {
                console.error("Token is missing or null")
                return thunkAPI.rejectWithValue({ message: "Token is required" })
            }
            
            const response = await clientServer.post("/get_user_and_profile", {
                token: token
            });

            return thunkAPI.fulfillWithValue(response.data)

        } catch(error){
            console.error("Error fetching user data:", error);
            console.error("Error response:", error.response?.data)
            return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch user data")
        }
    }
)


export const getAllUsers = createAsyncThunk(
    "user/getAllUsers",
    async (_, thunkAPI) =>{
        try{
            const response = await clientServer.get("/get_all_profiles")

            return thunkAPI.fulfillWithValue(response.data)
        } catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch users")
        }
    }
)


//update user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const response = await clientServer.post("/user_update");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Profile update failed");
    }
  } 
)

// sent connection request

export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/user/send_connection_request", {
                token: user.token,
                connectionId: user.user_id
            })

            thunkAPI.dispatch(getConnectionsRequest({ token: user.token }))
            return thunkAPI.fulfillWithValue(response.data);
        } catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || "Failed to send connection request");
        }
    }
)

//get connection request

export const getConnectionsRequest = createAsyncThunk(
    "user/getConnectionRequests",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/user/getConnectionRequests", {
                params: { token: user.token }
            });
            return thunkAPI.fulfillWithValue(response.data.connections);
        } catch (error) {
            console.log(error);
            return thunkAPI.rejectWithValue(error.response?.data || "Failed to get connection requests");
        }
    }
);


export const getMyConnections = createAsyncThunk(
    "user/getMyConnectionsRequests",
    async (user, thunkAPI) => {
        try{
            const response = await clientServer.get("/user/user_Connections_request", {
                params: {
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data.connections);
        } catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || "Failed to get my connections");
        }
    }
)


export const AcceptConnection = createAsyncThunk(
    "user/acceptConnection",
    async (user, thunkAPI) => {
        try{
            const response = await clientServer.post("/user/accept_connection_request", {
                token: user.token,
                connectionId: user.connectionId,
                action_type: user.action
            })
            return thunkAPI.fulfillWithValue(response.data);
        } catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || "Failed to accept connection");
        }
    }
)




