// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import styles from './EidtDept.module.css';
// import { FaArrowRight, FaSave, FaTimes, FaBuilding } from 'react-icons/fa';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchDepartmentById, setError, clearError } from '../../../../../Redux/slices/departmentSlice';

// const EditDept = () => {
//     const navigate = useNavigate();
//     const { id } = useParams(); // لو بتجيب بيانات القسم بناءً على id
//     const dispatch = useDispatch();
//     const { currentDepartment, error, loading } = useSelector(state => state.departmentAdmin);

//     const [dept, setDept] = useState({
//         name: '',
//         roles: []
//     });

//     const availableRoles = ['عرض', 'تعديل', 'إنشاء'];

//     useEffect(() => {
//         if (id) {
//             dispatch(fetchDepartmentById(id)); // جلب بيانات القسم حسب ID
//         }
//     }, [id, dispatch]);

//     useEffect(() => {
//         if (currentDepartment) {
//             setDept(currentDepartment); // تعيين البيانات إلى الاستيت
//         }
//     }, [currentDepartment]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setDept(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const toggleRole = (role) => {
//         setDept(prev => ({
//             ...prev,
//             roles: prev.roles.includes(role)
//                 ? prev.roles.filter(r => r !== role)
//                 : [...prev.roles, role]
//         }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         dispatch(clearError()); // مسح الأخطاء السابقة

//         if (!dept.name.trim()) {
//             dispatch(setError('يجب إدخال اسم القسم'));
//             return;
//         }

//         if (dept.roles.length === 0) {
//             dispatch(setError('يجب اختيار صلاحية واحدة على الأقل'));
//             return;
//         }

//         // إرسال التحديث
//         dispatch(updateDepartment({ id, updatedDept: dept }));
//         alert(`تم تحديث القسم "${dept.name}" بنجاح`);

//         // الرجوع لصفحة الأقسام
//         navigate('/admin/department');
//     };

//     const goBack = () => {
//         navigate('/admin/department');
//     };

//     return (
//         <div className={styles.container}>
//             <div className={styles.header}>
//                 <h2 className={styles.title}><FaBuilding /> تعديل القسم</h2>
//                 <button onClick={goBack} className={styles.backButton}>
//                     <FaArrowRight /> العودة للقائمة
//                 </button>
//             </div>

//             {loading ? (
//                 <div>جاري تحميل البيانات...</div>
//             ) : (
//                 <form onSubmit={handleSubmit} className={styles.form}>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="name">اسم القسم</label>
//                         <input
//                             type="text"
//                             id="name"
//                             name="name"
//                             value={dept.name}
//                             onChange={handleChange}
//                             className={styles.formControl}
//                             placeholder="أدخل اسم القسم"
//                         />
//                     </div>

//                     <div className={styles.formGroup}>
//                         <label>الصلاحيات المتاحة</label>
//                         <div className={styles.checkboxGroup}>
//                             {availableRoles.map(role => (
//                                 <label key={role} className={styles.checkboxItem}>
//                                     <input
//                                         type="checkbox"
//                                         value={role}
//                                         checked={dept.roles.includes(role)}
//                                         onChange={() => toggleRole(role)}
//                                     />
//                                     {role}
//                                 </label>
//                             ))}
//                         </div>
//                     </div>

//                     {error && <div className={styles.errorMessage}>{error}</div>}

//                     <div className={styles.buttonGroup}>
//                         <button type="submit" className={styles.saveButton}>
//                             <FaSave /> تحديث القسم
//                         </button>
//                         <button type="button" className={styles.cancelButton} onClick={goBack}>
//                             <FaTimes /> إلغاء
//                         </button>
//                     </div>
//                 </form>
//             )}
//         </div>
//     );
// };

// export default EditDept;
