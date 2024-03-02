import Map from "../components/Map";
import SideBar from "../components/SideBar";
import styles from "./AppLayout.module.css";
import User from "../components/User";
import { useAuth } from "../contexts/FakeAuthCotntext";

function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.app}>
      <SideBar></SideBar>
      <Map></Map>
      {isAuthenticated && <User></User>}
    </div>
  );
}

export default AppLayout;
