

import { getAllPosts } from '../../config/redux/action/postAction';
import { getAboutUser, getAllUsers } from '../../config/redux/action/authAction';
import DashboardLayout from '../../layout/DashboardLayout';
import UserLayout from '../../layout/userLayout';
import { useRouter } from 'next/router'
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL } from '../../config';
import styles from './index.module.css';




export default function Discoverpage() {

    const authState = useSelector((state) => state.auth)  
    const dispatch = useDispatch();

    useEffect(()=>{
        // console.log("Discover: all_profiles_fetched:", authState.all_profiles_fetched);
        // console.log("Discover: all_users:", authState.all_users);
        
        if(!authState.all_profiles_fetched){
            // console.log("Discover: Dispatching getAllUsers");
            dispatch(getAllUsers());
        }
    }, [authState.all_profiles_fetched, dispatch])
    
    const router = useRouter();
    return(
        <UserLayout>
            
           <DashboardLayout>    
            <div>
                <h1>Discover</h1>

                <div className={styles.allUserProfile}>
                    {authState.all_profiles_fetched && authState.all_users.map((user) =>{
                        return (
                            <div onClick={() =>{
                                router.push(`/view_profile/${user.userId.username}`)
                            }} key={user._id} className={styles.userCard}>
                                <img src={`${BASE_URL}/${user.userId.profilePicture || 'default.jpg'}`} alt="profile" />
                                <h1>{user.userId?.name}</h1>
                                <p>{user.userId?.username}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
           </DashboardLayout>
                
            
        </UserLayout>
    )
}
