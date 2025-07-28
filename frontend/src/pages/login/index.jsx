import UserLayout from '@/layout/userLayout'
import { registerUser } from '@/config/redux/action/authAction'
import { loginUser } from '@/config/redux/action/authAction'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import styles from "./style.module.css";
import { emptyMessage } from '@/config/redux/reducer/authReducer'

function LoginComponent(){

    const authState = useSelector((state) => state.auth)

    const router = useRouter();

    const dispatch = useDispatch();

    const [userLoginMethod, setUserLoginMethod] = useState(false);

    const [email, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    

    useEffect(()=>{
        if (authState.loggedIn){
            router.push("/dashboard");
        }
    }, [authState.loggedIn])

    useEffect(() =>{
        dispatch(emptyMessage());
    }, [authState.loggedIn])

    //login page
    useEffect(() => {
        if (localStorage.getItem("token")) {
            router.push("/dashboard");
        }
    }, []);
    
    //Dashboard page
    useEffect(() => {
        if (!localStorage.getItem("token")) {
            router.push("/login");
        }
    }, []);

    const handleRegister = () => {
       
        console.log("registering..");
        
      
        dispatch(registerUser({ username, password, email, name }))
    }

    const handleLogin = () => {
       
        console.log("login..")
        
        dispatch(loginUser({ email, password }))
    }


    return(
        <UserLayout>

            <div className={styles.container}>

                <div className={styles.cardContainer}>

                    <div className={styles.cardContainer_left}>

                        <p className={ styles.cardleft_heading}> {userLoginMethod ? "Sign IN" : "Sign Up"}</p>
                        <p style={{color: authState.isError ? "red" : "green"}}>
                            {authState.message?.message || authState.message || ""}
                        </p>


                        <div className={styles.inputContainers}>

                            {!userLoginMethod && <div className={styles.inputRow}>
                                <input onChange={(e)=>setUsername(e.target.value)} className={styles.inputFeild} type="text" placeholder="Username" />
                            
                                <input onChange={(e)=>setName(e.target.value)} className={styles.inputFeild} type="text" placeholder="Name" />
                            </div>}

                            <input onChange={(e)=>setEmailAddress(e.target.value)} className={styles.inputFeild} type="text" placeholder="Email" />

                            <input onChange={(e)=>setPassword(e.target.value)} className={styles.inputFeild} type="text" placeholder="Password" />

                            <div onClick={()=>{
                                if(userLoginMethod){
                                    handleLogin();
                                } else{
                                    handleRegister();
                                }
                            }} className={styles.buttonWithOutline}>
                                <p>{userLoginMethod ? "Sign IN" : "Sign Up"}</p>
                            </div>
                        </div>



                    </div>  

                    <div className={styles.cardContainer_right}>
                    
                        {userLoginMethod ? <p>Don't have an Account? </p> : <p> Already Have an Account ? </p>}
                        <div onClick={()=>{
                            setUserLoginMethod(!userLoginMethod)
                        }} style={{ color: "black", textAlign: "center"}} className={styles.buttonWithOutline}>
                            <p>{userLoginMethod ? "Sign Up" : "Sign IN"}</p>
                            

                        </div>

                    </div>
                    
                    
                </div>
            </div>
             

            
        </UserLayout>
    )
}

export default LoginComponent
















