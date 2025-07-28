import { getAllConnections, getMyConnections } from '../../config/redux/action/authAction'
import DashboardLayout from '../../layout/DashboardLayout'
import UserLayout from '../../layout/userLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function MyConnectionsPage() {
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth)

console.log("object",authState)
    useEffect(() =>{
        dispatch(getMyConnections({ token: localStorage.getItem("token")}));

    }, [])

    useEffect(()=>{
        
        if ( authState.connectionRequest.length != 0){
            console.log(authState.connectionRequest)
        }
        

    }, [authState.connectionRequest])

    

    return (
        <UserLayout>
            <DashboardLayout>
                <div>
                    <h1>My Connections</h1>
                    <h2>Received Requests</h2>
                    <ul>
                        {/* {connections?.received?.map((conn, idx) => (
                            <li key={idx}>{conn.userId?.name || 'Unknown User'}</li>
                        ))} */}
                    </ul>
                    <h2>Sent Requests</h2>
                    <ul>
                        {/* {connections?.sent?.map((conn, idx) => (
                            <li key={idx}>{conn.connectionId?.name || 'Unknown User'}</li>
                        ))} */}
                    </ul>
                </div>
            </DashboardLayout>
        </UserLayout>
    );
}