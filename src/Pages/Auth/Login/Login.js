import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import Logo from "../../../assets/Logo.jpg";
import { useDispatch, useSelector } from "react-redux";
import { updateField, setErrors } from "../../../Redux/slices/applicationSlice";
import { useNavigate } from "react-router-dom";
import apiService from "../../../utils/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { email, password } = useSelector((state) => state.application.formData);
  const { errors } = useSelector((state) => state.application);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (token) {
      console.log("Token found in storage, redirecting...");
      if (role === "ادمن") {
        navigate("/admin");
      } else {
        navigate("/inbox");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    dispatch(updateField({ field: id, value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email) {
      newErrors.email = "البريد الإلكتروني مطلوب.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة.";
    }

    if (!password) {
      newErrors.password = "كلمة المرور مطلوبة.";
    }

    dispatch(setErrors(newErrors));

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await apiService.login(email, password);

        if (response.status === 200) {
          const { role, token } = response.data;
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("role", role);

          if (role === "ادمن") {
            navigate("/admin");
          } else {
            navigate("/inbox");
          }
        } else {
          dispatch(setErrors({ email: "حدث خطأ في عملية تسجيل الدخول." }));
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          dispatch(setErrors({ email: "البريد الإلكتروني أو كلمة المرور غير صحيحة." }));
        } else {
          console.error("Error logging in:", error);
          dispatch(setErrors({ email: "حدث خطأ غير متوقع." }));
        }
      }
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.cardContent}>
          <div className={styles.loginImage}>
            <img src={Logo} alt="Logo" className={styles.loginLogo} />
          </div>

          <div className={styles.loginForm}>
            <h3 className={styles.title}>تسجيل الدخول</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>البريد الإلكتروني</label>
                <input
                  type="email"
                  id="email"
                  className={`${styles.inputt} ${errors.email ? styles.invalid : ""}`}
                  placeholder="أدخل بريدك"
                  value={email || ""}
                  onChange={handleChange}
                />
                {errors.email && <div className={styles.error}>{errors.email}</div>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>كلمة المرور</label>
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`${styles.inputt} ${errors.password ? styles.invalid : ""}`}
                    placeholder="*********"
                    value={password || ""}
                    onChange={handleChange}
                  />
                  <span className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {errors.password && <div className={styles.error}>{errors.password}</div>}
              </div>

              <button type="submit" className={styles.submitButton}>تسجيل الدخول</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
