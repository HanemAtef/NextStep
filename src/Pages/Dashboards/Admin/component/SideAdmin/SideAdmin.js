
// Sidebar.js
import React, { useState } from "react";
import { MdCategory } from 'react-icons/md';
import { MdAssignment } from 'react-icons/md';
import { PiUsersThreeFill } from "react-icons/pi";
import { RiDashboardLine } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import styles from "./SideAdmin.module.css";

export default function SideAdmin() {
    const location = useLocation();
    const path = location.pathname;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className={styles.toggleButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>

            <div className={`${styles.sidebar} ${isOpen ? styles.show : ""}`}>
                <Link to="requests" className={styles.dashboardButton}>
                    <RiDashboardLine className={styles.dashIcon} />
                    <span>لوحة التحكم</span>
                </Link>

                {/* <div className={styles.sectionTitle}>الطلبات</div> */}

                <ul className={styles.sidebarMenu}>
                    <li>
                        <Link
                            to="requests"
                            className={`${styles.sidebarItem} ${path.endsWith("/requests") ? styles.active : ""
                                }`}
                        >
                            <MdAssignment className={styles.sidebarIcon} />
                            <span>الطلبات </span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="department"
                            className={`${styles.sidebarItem} ${path.endsWith("/department") ? styles.active : ""
                                }`}
                        >
                            <MdCategory className={styles.sidebarIcon} />
                            <span> الاقسام </span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="users"
                            className={`${styles.sidebarItem} ${path.endsWith("/users") ? styles.active : ""
                                }`}
                        >
                            <PiUsersThreeFill className={styles.sidebarIcon} />
                            <span> الموظفون </span>
                        </Link>
                    </li>



                </ul>
            </div>
        </>
    );
}
