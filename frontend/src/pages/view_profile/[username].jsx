import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { clientServer, BASE_URL } from '../../config'
import UserLayout from '../../layout/userLayout'
import DashboardLayout from '../../layout/DashboardLayout'
import styles from './index.module.css'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { getAllPosts } from '../../config/redux/action/postAction'
import { getConnectionsRequest, sendConnectionRequest } from '../../config/redux/action/authAction'
import DownloadProfileButton from "../../Components/DownloadProfileButton";


// import { useAuth } from '../../config/context/AuthContext'
// import { getConnectionsRequesst } from '../../config/redux/action/connectionAction'


export default function viewProfilePge({ userProfile}) {



  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  
  
  const [userPosts, setUserPost] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  // Only fetch posts and connections if not already fetched
  useEffect(() => {
    if (!postReducer.postFetched) {
      dispatch(getAllPosts());
    }
    if (
      localStorage.getItem("token") &&
      !authState.connectionsFetched &&
      authState.connections.length === 0
    ) {
      dispatch(getConnectionsRequest({ token: localStorage.getItem("token") }));
    }
  }, [dispatch, postReducer.postFetched, authState.connectionsFetched, authState.connections.length]);

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      
      return post.userId.username === router.query.username
    })
    
    setUserPost(post);
  }, [postReducer.posts, router.query.username])

  useEffect(()=>{
    console.log(authState.connections, userProfile.userId._id)
    if(authState.connections.some(user => user.connectionId._id === userProfile.userId._id)){
      setIsCurrentUserInConnection(true)
      if(authState.connections.find(user => user.connectionId._id === userProfile.userId._id).status_accepted === "pending"){
        setIsConnectionNull(false)
      }
    }
  }, [authState.connections, userProfile.userId._id])
    


  useEffect(() =>{

    // getUsersPost(); // This line is removed as per the new_code

 
  }, [] )

  return (
    <UserLayout>
      
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
              
            <img className={styles.profilePicture} src={`${BASE_URL}/${userProfile.userId.profilePicture || 'default.jpg'}`} alt="profile" />
          </div>
        

          <div className={styles.profileContainer_details}>

          <div style={{display: "flex", gap: "0.7rem"}}>

            <div style={{flex: "0.8"}}> 

              <div style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "1.2rem"}}>
                <h2>{userProfile.userId.name}</h2>
                <p style={{ color: "grey" }}>@{userProfile.userId.username}</p>
              
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem"}}>

                {isCurrentUserInConnection ?
                  <button className={styles.connectedButton}>
                    {isConnectionNull ? "Pending" : "Connected"}
                  </button>
                  :
                  <button onClick={() =>{
                    dispatch(sendConnectionRequest({ token: localStorage.getItem("token"), user_id: userProfile.userId._id }))
                  }} className={styles.connectBtn}>Connect</button>}
                
                <DownloadProfileButton userId={userProfile.userId?._id || userProfile.userId || ""} />
              </div>
              
              <div>
                <p>{userProfile.bio}</p>
              </div>
              

            </div>

            <div style={{flex: "0.2"}}>
              <h3>Recent Activity</h3>
              {userPosts.map((post) =>{
                return (
                  <div key={post._id} className={styles.postCard}>
                    <div className={styles.card}>
                      <div className={styles.card_profileContainer}>

                        {post.media !== "" ? (
                          <img src={`${BASE_URL}/${post.media}`} alt="" />
                        ) : (
                          <div style={{ width: "3.4rem", height: "3.4rem" }}> </div>
                        )}

                      </div>
                      <p>{post.body}</p>
                    </div>
                  </div>
                )
              })}

            </div>

          </div>

          </div>

          <div className="workHistory">
            <h4>Work History</h4>
            <div className={styles.workHistoryContainer}>
              {
                userProfile.pastWork.map((work, index) => {
                  return(
                    <div key={index} className={styles.workHistoryCard}>
                      <p style={{ fontWeight: "bold", display: "flex", alignItem: "center", gap: "0.8rem"}}>{work.company} - {work.position}</p>
                      <p>{work.years}</p>
                    </div>
                  )
                }) || []
              }
            </div>

          </div>
        </div>
        
      </DashboardLayout>

    </UserLayout>       
  )
}

export async function getServerSideProps(context) {
  console.log("From View");
  console.log(context.query.username);

  const request = await clientServer.get("/user/get_profile_based_on_username", {
    params: {
      username: context.query.username
    }
  });
  
  // const userProfile = request.data.userProfile;
  // const user = request.data.user;
  // console.log(userProfile, user);

  const response = await request.data;
  console.log(response);
  
  return { props: { userProfile: response.userProfile, user: response.user } };

  
  // return { props: { userProfile, user } };
}
