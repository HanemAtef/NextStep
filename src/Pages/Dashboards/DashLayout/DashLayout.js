import React, { useEffect, useState } from "react";
import Sidebar from "../../../Component/Sidebar/Sidebar";
import Nav from "../../../Component/Nav/Nav";
import { Outlet, Link, useNavigate } from "react-router-dom";
import styles from "./DashLayout.module.css";

const DashLayout = ({ title }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const [canCreateRequests, setCanCreateRequests] = useState(false);

  useEffect(() => {
    const roles = JSON.parse(sessionStorage.getItem("roles") || "[]");
    const restrictedRoles = ["مجلس الكليه", "لجنه الدرسات العليا"];

    // Set canCreateRequests to true if user has any role that is not restricted
    setCanCreateRequests(roles.length > 0 && !roles.some(role => restrictedRoles.includes(role)));
  }, []);

  return (
    <div className={styles.layout}>
      <Nav />
      <Sidebar canCreate={canCreateRequests} />

      <header className={styles.header}>
        <h1>
          {"     "}
          {/* لوحة    تحكم */}
          {title}
          {"      "}
        </h1>
      </header>

      <div className={styles.mainContent}>
        <Outlet />
      </div>

    </div>
  );
};

export default DashLayout;

