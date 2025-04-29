import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddUser.module.css';
import { FaArrowRight, FaSave, FaTimes, FaUser } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addUser } from '../../../../../Redux/slices/employeeSlice';

const AddUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    email: '',
    password: '',
    userName: '',
    departmentId: '',
    roleId: '2',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!user.userName.trim()) {
      setError('يجب إدخال اسم المستخدم');
      return;
    }

    if (!user.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(user.email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    if (!user.password || user.password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }

    if (!user.departmentId) {
      setError('يرجى اختيار قسم صالح');
      return;
    }

    try {
      // Format the data to match API expectations
      const userData = {
        ...user,
        departmentId: parseInt(user.departmentId),
        roleId: parseInt(user.roleId),
        firstName: user.userName, // Use userName as firstName
        lastName: user.userName   // Use userName as lastName
      };

      // Send user data to API
      await dispatch(addUser(userData)).unwrap();

      // Success message
      alert(`تم إضافة المستخدم "${user.userName}" بنجاح`);

      // Navigate back to users list
      navigate('/admin/users');
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.message || 'حدث خطأ أثناء إضافة المستخدم');
    }
  };

  const goBack = () => {
    navigate('/admin/users');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}><FaUser /> إضافة مستخدم جديد</h2>
        <button onClick={goBack} className={styles.backButton}>
          <FaArrowRight /> العودة للقائمة
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="userName">اسم المستخدم</label>
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
          <label htmlFor="email">البريد الإلكتروني</label>
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

        {/* <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">رقم الهاتف</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={user.phoneNumber}
            onChange={handleChange}
            className={styles.formControl}
            placeholder="أدخل رقم الهاتف"
          />
        </div> */}

        <div className={styles.formGroup}>
          <label htmlFor="password">كلمة المرور</label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className={styles.formControl}
            placeholder="كلمة المرور (6 أحرف على الأقل)"
            required
            minLength="6"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="departmentId">القسم التابع له</label>
          <select
            id="departmentId"
            name="departmentId"
            value={user.departmentId}
            onChange={handleChange}
            className={styles.formControl}
            required
          >
            <option value="">اختر القسم</option>
            <option value="1">مجلس الكليه</option>
            <option value="2">لجنه الدرسات العليا</option>
            <option value="3">حسابات علميه</option>
            <option value="4">ذكاء اصطناعي</option>
            <option value="5">علوم حاسب</option>
            <option value="6">نظم المعلومات</option>
            <option value="7">إدارة الدرسات العليا</option>
          </select>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveButton}>
            <FaSave /> إضافة المستخدم
          </button>
          <button type="button" className={styles.cancelButton} onClick={goBack}>
            <FaTimes /> إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
