import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import UserLayout from "../layout/userLayout";
import LoginComponent from "./login";

export default function Home() {
  const router = useRouter();

  return (   
    <UserLayout>
      {/* Now these two are never conflict with each other */}
      <div className={styles.container}>

        <div className={styles.mainContainer}>
          
          <div className={styles.mainContainer_left}>
            <p>Connect with your friends without Exaggeration</p>
            <p>A True social media platform, with stories no bluffs !</p>
            <div onClick={() => {
              router.push("/login")
            }} className={styles.buttonJoin}>
              <p>Join Now</p>
            </div>
          </div>

          <div className={styles.mainContainer_right}>
            <img src="images/homemain-connection.jpg" alt="Home main connection" /> 
          </div>

        </div>
      </div>
    </UserLayout>   
  );
}
