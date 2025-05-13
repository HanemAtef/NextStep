
import React, { useState } from "react";
import { FiInbox, FiPlus, FiSend } from "react-icons/fi";
import { RiDashboardLine } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar({ canCreate }) {
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
        <Link to="inbox" className={styles.dashboardButton}>
          <RiDashboardLine className={styles.dashIcon} />
          <span>لوحة التحكم</span>
        </Link>

        <div className={styles.sectionTitle}>الطلبات</div>

        <ul className={styles.sidebarMenu}>
          <li>
            <Link
              to="inbox"
              className={`${styles.sidebarItem} ${path.endsWith("/inbox") ? styles.active : ""
                }`}
            >
              <FiInbox className={styles.sidebarIcon} />
              <span>الطلبات الواردة</span>
            </Link>
          </li>

          <li>
            <Link
              to="outbox"
              className={`${styles.sidebarItem} ${path.endsWith("/outbox") ? styles.active : ""
                }`}
            >
              <FiSend className={styles.sidebarIcon} />
              <span>الطلبات الصادرة</span>
            </Link>
          </li>

          {canCreate && (
            <li>
              <Link
                to="create"
                className={`${styles.sidebarItem} ${path.endsWith("/create") ? styles.active : ""
                  }`}
              >
                <FiPlus className={styles.sidebarIcon} />
                <span>إنشاء طلب جديد</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
