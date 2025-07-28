import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./reducer/authReducer"
import postReducer from "./reducer/postReducer"


/* 
*
*Steps for state ,Management
submit Action
handle action in its reducer
register here -> Reducer
*
*
*
*/

const store = configureStore({
   reducer:{
      auth: authReducer,
      postReducer: postReducer
   } 
})

export default store;

 