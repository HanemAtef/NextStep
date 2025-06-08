import React from "react";
import Nav from "../../../../Component/Nav/Nav";
import { Outlet } from "react-router-dom";
import styles from "./ReportsDash.module.css";

export default function ReportsDash({ title }) {
    return (
        <div className={styles.layout}>
            <Nav />

            <div className={styles.contentWrapper}>
                <header className={styles.dashboardHeader}>
                    {/* <h1>{title || "إدارة التقارير"}</h1> */}
                </header>
                <main className={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
} 