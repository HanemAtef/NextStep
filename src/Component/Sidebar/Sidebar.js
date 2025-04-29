
// import React from "react";
// import { CiInboxIn } from "react-icons/ci";
// import { FiInbox } from "react-icons/fi";

// import { FiPlus } from "react-icons/fi";
// import { FiSend } from "react-icons/fi";
// import { RiDashboardLine } from "react-icons/ri";
// import styles from "./Sidebar.module.css";

// export default function Sidebar({
//   setActiveComponent,
//   activeComponent,
//   canCreate,
// }) {
//   return (
//     <div className={styles.sidebar}>
//       <div className={styles.dashboardButton} onClick={() => setActiveComponent("inbox")}>
//         <RiDashboardLine className={styles.dashIcon} />
//         <span>لوحة التحكم</span>
//       </div>

//       <div className={styles.sectionTitle}>الطلبات</div>

//       <ul className={styles.sidebarMenu}>
//         <li
//           className={`${styles.sidebarItem} ${activeComponent === "inbox" ? styles.active : ""}`}
//           onClick={() => setActiveComponent("inbox")}
//         >
//           <FiInbox className={styles.sidebarIcon} />
//           <span>الطلبات الواردة</span>
//         </li>
//         <li
//           className={`${styles.sidebarItem} ${activeComponent === "outbox" ? styles.active : ""}`}
//           onClick={() => setActiveComponent("outbox")}
//         >
//           <FiSend className={styles.sidebarIcon} />
//           <span>الطلبات الصادرة</span>
//         </li>
//         {canCreate && (
//           <li
//             className={`${styles.sidebarItem} ${activeComponent === "create" ? styles.active : ""}`}
//             onClick={() => setActiveComponent("create")}
//           >
//             <FiPlus className={styles.sidebarIcon} />
//             <span>إنشاء طلب جديد</span>
//           </li>
//         )}
//       </ul>
//     </div>
//   );
// }



// Sidebar.js
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
      {/* زر الهامبرغر لفتح/إغلاق الـ Sidebar في الشاشات الصغيرة */}
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
