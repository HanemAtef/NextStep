

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addDepartment } from '../../../../../Redux/slices/departmentSlice';
import styles from './CreateDept.module.css';
import { FaArrowRight, FaSave, FaTimes, FaBuilding } from 'react-icons/fa';

const CreateDept = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [departmentName, setDepartmentName] = useState('');

  const handleChange = (e) => {
    setDepartmentName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!departmentName.trim()) {
      setError('يجب إدخال اسم القسم');
      return;
    }

    try {
      await dispatch(addDepartment({ departmentName })).unwrap();
      alert(`تم إضافة القسم "${departmentName}" بنجاح`);
      navigate('/admin/department');
    } catch (err) {
      setError('حدث خطأ أثناء إضافة القسم');
    }
  };

  const goBack = () => {
    navigate('/admin/department');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}><FaBuilding /> إضافة قسم جديد</h2>
        <button onClick={goBack} className={styles.backButton}>
          <FaArrowRight /> العودة للقائمة
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="departmentName">اسم القسم</label>
          <input
            type="text"
            id="departmentName"
            name="departmentName"
            value={departmentName}
            onChange={handleChange}
            className={styles.formControl}
            placeholder="أدخل اسم القسم"
            required
          />
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveButton}>
            <FaSave /> إضافة القسم
          </button>
          <button type="button" className={styles.cancelButton} onClick={goBack}>
            <FaTimes /> إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDept;
