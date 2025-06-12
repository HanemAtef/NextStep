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

    const role = sessionStorage.getItem("role") || "";
    setUserRole(role);


    const isCommitteeOrCouncil =
      (role.includes("لجنه") || role.includes("لجنة")) ||
      role.includes("مجلس");

    setCanCreateRequests(role.includes("موظف") && !isCommitteeOrCouncil);

    // console.log("DashLayout - User Role:", role);
    // console.log("DashLayout - Can Create Requests:", role.includes("موظف") && !isCommitteeOrCouncil);
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

