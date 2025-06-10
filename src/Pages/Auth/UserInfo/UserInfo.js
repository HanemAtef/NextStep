import React, { useState, useEffect, useMemo } from "react";
import defaultAvatar from "../../../assets/avatar.jpg";
import styles from './UserInfo.module.css';
import { useDispatch, useSelector } from "react-redux";
import { updateField, resetForm } from "../../../Redux/slices/applicationSlice";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaBuilding, FaSignOutAlt, FaCamera, FaChartBar, FaArrowRight } from "react-icons/fa";

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

function UserInfo() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [avatar, setAvatar] = useState(() => {
    return sessionStorage.getItem("userAvatar") || defaultAvatar;
  });

  const userName = useSelector(state => state.application.formData.name);
  const userId = useSelector(state => state.application.formData.id);
  const userDepartment = useSelector(state => state.application.formData.department);
  const userEmail = useSelector(state => state.application.formData.email);

  const userData = useMemo(() => ({
    name: userName,
    id: userId,
    department: userDepartment,
    email: userEmail,
  }), [userName, userId, userDepartment, userEmail]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("صورة كبيرة جدًا. الرجاء اختيار صورة أقل من 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        setAvatar(result);
        sessionStorage.setItem("userAvatar", result);
      };
      reader.onerror = () => {
        alert("حدث خطأ أثناء قراءة الملف");
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError("لم يتم العثور على بيانات المستخدم. الرجاء تسجيل الدخول مرة أخرى.");
        setLoading(false);
        return;
      }

      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        setError("فشل في تحليل بيانات المستخدم من التوكن.");
        setLoading(false);
        return;
      }

      const name = decodedToken.name || decodedToken.sub || decodedToken.username || "مستخدم";
      const email = decodedToken.email || "";
      const department = decodedToken.department || sessionStorage.getItem("role") || "";
      const id = decodedToken.id || decodedToken.sub || "";

      dispatch(updateField({ field: "name", value: name }));
      dispatch(updateField({ field: "id", value: id }));
      dispatch(updateField({ field: "department", value: department }));
      dispatch(updateField({ field: "email", value: email }));

      if (!name || name === "مستخدم") {
        const role = sessionStorage.getItem("role");
        if (role) {
          dispatch(updateField({ field: "name", value: role }));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("فشل في تحميل بيانات المستخدم:", error);
      setError("فشل في تحميل بيانات المستخدم");
      setLoading(false);
    }
  }, [dispatch]);

  const handleLogout = () => {
    if (window.confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟")) {
      dispatch(resetForm());
      sessionStorage.removeItem("userAvatar");
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      navigate('/login');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/reports');
  };

  // Check if user belongs to reports department
  const isReportsDepartment = userData.department &&
    (userData.department.includes('تقارير') ||
      userData.department.includes('احصائيات') ||
      userData.department.toLowerCase().includes('report') ||
      userData.department.toLowerCase().includes('statistics'));

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.userCardd}>
      {isReportsDepartment && (
        <button className={styles.cardCornerBtn} onClick={handleGoToDashboard}>
          <FaArrowRight className={styles.backIcon} /> العودة لصفحة التقارير
        </button>
      )}

      <div className={styles.rightSection}>
        <div className={styles.avatarWrapper}>
          <img
            src={avatar}
            alt="User Avatar"
            className={styles.avatar}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
          <label htmlFor="avatarInput" className={styles.cameraIcon} title="تغيير الصورة الشخصية">
            <FaCamera />
          </label>
          <input
            type="file"
            id="avatarInput"
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        <div className={styles.userWelcome}>
          <h2>مرحباً {userData.name || "..."}</h2>
          <div className={styles.userIdBadge}>ID: {userData.id || "..."}</div>
        </div>

        <div className={styles.bottomSection}>
          <p><FaUser className={styles.infoIcon} /> <strong>الاسم:</strong> {userData.name || "..."}</p>
          <p><FaEnvelope className={styles.infoIcon} /> <strong>الإيميل:</strong> {userData.email || "..."}</p>
          <p><FaBuilding className={styles.infoIcon} /> <strong>القسم/الإدارة:</strong> {userData.department || "..."}</p>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt className={styles.logoutIcon} /> تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;



