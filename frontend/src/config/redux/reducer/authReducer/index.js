import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, getAboutUser, getAllUsers, getConnectionsRequest, getMyConnections, AcceptConnection } from "../../action/authAction";

const initialState = {
    user: undefined,
    isError: false,
    isSuccess: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    isTokenThere: false,
    profileFetched: false,
    connections: [],
    connectionsFetched: false,
    connectionRequest: [],
    all_users: [],
    all_profiles_fetched: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: () => initialState,
        handleLoginUser: (state) =>{
            state.message = "hello"
        },
        emptyMessage: (state) =>{
            state.message = ""
        },
        setTokenIsThere: (state) =>{
            state.isTokenThere = true
        },
        setTokenIsNotThere: (state) =>{
            state.isTokenThere = false
            dispatch(setTokenIsThere(false))
        },
        resetConnectionsFetched: (state) => {
            state.connectionsFetched = false;
        }
    },
    extraReducers: (builder) =>{
        builder
        .addCase(loginUser.pending, (state)=>{
            state.isLoading = true
            state.message = "Knocking the door..."
        })
        .addCase(loginUser.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.loggedIn = true;
            state.message = "Login is Successfull"
            if (action.payload.token) {
                localStorage.setItem("token", action.payload.token);
            }
        })
        .addCase(loginUser.rejected, (state, action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
        .addCase(registerUser.pending, (state)=>{
            state.isLoading = true;
            state.message = "Registering you..."
        })
        .addCase(registerUser.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.loggedIn = true;
            state.message = { 
                message:"Registration is Successfull, Please Login"
            }

        })
        .addCase(registerUser.rejected, (state, action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = typeof action.payload === "string"
                ? { message: action.payload }
                : action.payload;
        })
        .addCase(getAboutUser.pending, (state)=>{
            state.isLoading = true;
            state.message = "Fetching user data..."
        })

        .addCase(getAboutUser.rejected, (state, action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })

        .addCase(getAboutUser.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.isError = false;
            state.profileFetched = true;
            state.user = action.payload.profile;
            // state.message = "User data fetched successfully"
        })

        .addCase(getAllUsers.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.isError = false;
            state.all_profiles_fetched = true;
            state.all_users = action.payload.profiles;
            console.log(state.all_users)
            
        })
        .addCase(getConnectionsRequest.fulfilled, (state, action) => {
            state.connections = action.payload;
            state.connectionsFetched = true;
        })
        .addCase(getConnectionsRequest.rejected, (state, action) => {
            state.message = action.payload;
        })
        .addCase(getMyConnections.fulfilled, (state, action) => {
            state.connectionRequest = action.payload;
        })
        .addCase(getMyConnections.rejected, (state, action) => {
            state.message = action.payload;
        })
        // .addCase(AcceptConnection.fulfilled, (state, action) => {
        //     // You can update state as needed, e.g. remove the accepted request from connectionRequest
        //     state.message = "Connection accepted";
        // })
        // .addCase(AcceptConnection.rejected, (state, action) => {
        //     state.message = action.payload;
        // })
        
    }
})

export const { reset, emptyMessage, setTokenIsThere, setTokenIsNotThere, resetConnectionsFetched } = authSlice.actions;
export default authSlice.reducer;
