import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Nav.module.css';
import navlogo from './navLogo.png';
import logo from './logoCollage.jpg';
import logo2 from './logoUnivercity.png';
import user from './image.png';

export default function Nav() {
  const userRole = sessionStorage.getItem("role");

  const userProfilePath = userRole === "ادمن" ? "/admin/user" : "/user";

  return (
    <div className={styles.navbar}>
      <div className={styles.brandSection}>
        <img src={logo2} alt='logo' className={styles.logo} />
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
        <img src={logo} alt='logo' className={styles.logo} />

      </div>

    </div>
  );
}

