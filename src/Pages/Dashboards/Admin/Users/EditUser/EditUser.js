import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, updateUser, setError } from '../../../../../Redux/slices/employeeSlice';
import styles from './EditUser.module.css';
import { FaArrowRight, FaSave, FaTimes, FaUser } from 'react-icons/fa';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userState = useSelector((state) => state.userAdmin);
  const { currentUser, loading, error } = userState;

  const [user, setUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userName: '',
    departmentID: 0
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentUser) {
      setUser({
        email: currentUser.email || '',
        userName: currentUser.name || '',
        password: '',
        confirmPassword: '',
        departmentID: currentUser.departmentID || currentUser.departmentId || 0
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setError(null));

    if (!user.userName.trim()) {
      dispatch(setError('يجب إدخال اسم المستخدم'));
      return;
    }

    if (!validateEmail(user.email)) {
      dispatch(setError('يرجى إدخال بريد إلكتروني صحيح'));
      return;
    }

    if (user.password) {
      if (user.password.length < 6) {
        dispatch(setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل'));
        return;
      }

      if (user.password !== user.confirmPassword) {
        dispatch(setError('كلمة المرور وتأكيد كلمة المرور غير متطابقين'));
        return;
      }
    }

    const updatedUser = {
      name: user.userName,
      email: user.email
    };

    if (user.password && user.password.trim()) {
      updatedUser.password = user.password;
    }

    if (user.departmentID) {
      updatedUser.departmentID = parseInt(user.departmentID);
    }

    console.log("Sending data to API:", updatedUser);
    dispatch(updateUser({ id, updatedUser }))
      .then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          alert(`تم تعديل بيانات المستخدم "${user.userName}" بنجاح`);
          navigate('/admin/users');
        }
      })
      .catch((error) => {
        console.error("Error updating user:", error);
      });
  };

  const goBack = () => {
    navigate('/admin/users');
  };

  if (loading) {
    return <div className={styles.loading}>جاري تحميل البيانات...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={goBack} className={styles.backButton}>
          <FaArrowRight /> العودة للقائمة
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}><FaUser /> تعديل بيانات المستخدم</h2>
        <button onClick={goBack} className={styles.backButton}>
          <FaArrowRight /> العودة للقائمة
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="userName">الاسم </label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={user.userName}
            onChange={handleChange}
            className={styles.formControl}
            placeholder="أدخل اسم المستخدم"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">البريد الإلكتروني </label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className={styles.formControl}
            placeholder="example@domain.com"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">كلمة المرور الجديدة</label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className={styles.formControl}
            placeholder="كلمة المرور (6 أحرف على الأقل)"
            minLength="6"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleChange}
            className={styles.formControl}
            placeholder="أعد كتابة كلمة المرور"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="departmentID">القسم</label>
          <input
            type="number"
            id="departmentID"
            name="departmentID"
            value={user.departmentID}
            onChange={handleChange}
            className={styles.formControl}
            placeholder="رقم القسم"
          />
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveButton}>
            <FaSave /> حفظ التغييرات
          </button>
          <button type="button" className={styles.cancelButton} onClick={goBack}>
            <FaTimes /> إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
