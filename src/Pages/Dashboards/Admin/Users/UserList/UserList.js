import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userCss from './UserList.module.css';
import { FaTimes } from 'react-icons/fa';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from '../../../../../Redux/slices/employeeSlice';

const UserList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");


  const { data: users, loading, error } = useSelector((state) => state.userAdmin);

  useEffect(() => {

    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = () => {
    if (requestToDelete) {
      dispatch(deleteUser(requestToDelete.id));
      setShowModal(false);
      setRequestToDelete(null);
    }
  };

  const goToEditUser = (id) => {
    navigate(`/admin/users/edit/${id}`);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={userCss.container}>
      <h2 className={userCss.title}> بيانات المستخدمين</h2>

      <div className={userCss.topBar}>
        <div className={userCss.searchContainer}>
          <input
            type="text"
            placeholder="بحث..."
            className={userCss.searchInputt}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className={userCss.createButton} onClick={() => navigate('/admin/users/add')}>
          إنشاء
        </button>
      </div>

      {loading && <p>جاري تحميل البيانات...</p>}
      {error && <p>حدث خطأ: {error}</p>}

      <table className={userCss.table}>
        <thead>
          <tr>
            <th>الرقم</th>
            <th>الاسم</th>
            <th>البريد الالكتروني</th>
            <th>الوظيفة</th>
            <th>العمليات</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.id} className={userCss.tableRow}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>

              <td>
                <button className={userCss.iconedit} onClick={() => goToEditUser(user.id)}>
                  <FiEdit size={24} />
                </button>
                <button className={userCss.icondelete} onClick={() => {
                  setRequestToDelete(user);
                  setShowModal(true);
                }}>
                  <FiTrash2 size={25} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && requestToDelete && (
        <div className={userCss.modalStyles}>
          <div className={userCss.modalContentStyles}>
            <div className={userCss.deleteHead}>
              <h5>حذف مستخدم</h5>
              <button className={userCss.close} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <p>هل أنت متأكد أنك تريد الحذف؟</p>
            <div className={userCss.btns}>
              <button className={userCss.ok} onClick={handleDelete}>تأكيد</button>
              <button className={userCss.no} onClick={() => setShowModal(false)}>الغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
