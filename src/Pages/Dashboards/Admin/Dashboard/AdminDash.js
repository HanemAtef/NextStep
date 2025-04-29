
import React from "react";
import SideAdmin from "../component/SideAdmin/SideAdmin"
import Nav from "../../../../Component/Nav/Nav";
import { Outlet } from "react-router-dom";  // سيظهر المحتوى الداخلي هنا
import styles from "./AdminDash.module.css";
export default function AdminDash({ title }) {
    // console.log("AdminDash Rendered with title: ", title);
    return (
        <div className={styles.layout}>
            <Nav />
            <SideAdmin />


            <header className={styles.header}>
                <h1>
                    {"  "}
                    لوحة تحكم
                    {title}{"   "}
                </h1>
            </header>

            <div className={styles.mainContent}>
                <Outlet />
            </div>

        </div>
    );
}

