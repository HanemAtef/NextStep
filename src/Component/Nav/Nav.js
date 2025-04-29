import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Nav.module.css';
import navlogo from './navLogo.png';
import user from './image.png'; // Assuming you have a user image

export default function Nav() {
  // Get user role from sessionStorage
  const userRole = sessionStorage.getItem("role");

  const userProfilePath = userRole === "ادمن" ? "/admin/user" : "/user";

  return (
    <div className={styles.navbar}>
      <div className={styles.brandSection}>
        <img src={navlogo} alt='logo' className={styles.logo} />
        <h2 className={styles.title}>نظام رابط</h2>
      </div>
      <div className={styles.userSection}>
        <Link to={userProfilePath} className={styles.avatarContainer}>
          <img
            src={user}
            alt='user'
            className={styles.avatar}
          />
        </Link>
      </div>
    </div>
  );
}

