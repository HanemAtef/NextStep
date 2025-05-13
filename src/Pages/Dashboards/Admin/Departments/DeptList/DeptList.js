

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, deleteDepartment } from '../../../../../Redux/slices/departmentSlice';
import { useNavigate } from 'react-router-dom';
import userCss from './DeptList.module.css';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaTimes } from 'react-icons/fa';

const DeptList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const departmentAdmin = useSelector(state => state.departmentAdmin) || {};
  const { data: departments = [], loading, error } = departmentAdmin;

  const [showModal, setShowModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleDelete = () => {
    if (requestToDelete) {
      dispatch(deleteDepartment(requestToDelete.id));
      setShowModal(false);
      setRequestToDelete(null);
    }
  };

  const filtered = departments.filter(dept =>
    dept.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={userCss.container}>
      <h2 className={userCss.title}>الاقسام المتاحه</h2>
      <div className={userCss.topActions}>
        <div className={userCss.searchContainer}>
          <input
            type="text"
            placeholder="البحث بإسم القسم..."
            className={userCss.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className={userCss.createButton} onClick={() => navigate('/admin/department/add')}>
          إنشاء
        </button>
      </div>
      {loading ? (
        <p>جاري التحميل...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>حدث خطأ: {error}</p>
      ) : (
        <table className={userCss.table}>
          <thead>
            <tr>
              <th>الرقم</th>
              <th>الاسم</th>

              <th>العمليات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dept, index) => (
              <tr key={dept.id}>
                <td>{index + 1}</td>
                <td>{dept.departmentName}</td>

                <td>
                  <button className={userCss.icondelete} onClick={() => {
                    setRequestToDelete(dept);
                    setShowModal(true);
                  }}>
                    <FiTrash2 size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && requestToDelete && (
        <div className={userCss.modaluserCss}>
          <div className={userCss.modalContentuserCss}>
            <div className={userCss.deleteHead}>
              <h5>حذف القسم</h5>
              <button className={userCss.close} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <p>هل أنت متأكد أنك تريد الحذف؟</p>
            <div className={userCss.btns}>
              <button className={userCss.ok} onClick={handleDelete}>تأكيد</button>
              <button className={userCss.no} onClick={() => setShowModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptList;
