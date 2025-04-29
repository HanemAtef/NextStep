import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from 'react-icons/fa';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import styles from "./RequestList.module.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchrequests, deleterequest } from "../../../../../Redux/slices/requestSlice"; // التأكد من استيراد الأكشن

export default function RequestList() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: requests = [], loading } = useSelector((state) => state.requestAdmin);

    const filteredRequests = requests?.filter(request =>
        (request.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        dispatch(fetchrequests()); 
    }, [dispatch]);

    const handleDelete = () => {
        if (requestToDelete) {
            dispatch(deleterequest(requestToDelete.id)); 
            setShowModal(false);
            setRequestToDelete(null);
        }
    };

    const goToAddRequest = () => {
        navigate("/admin/requests/add");
    };

    const goToEditRequest = (id) => {
        navigate(`/admin/requests/edit/${id}`);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>إدارة الطلبات</h2>

            <div className={styles.topActions}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="البحث بإسم الطلب..."
                        className={styles.searchInputt}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className={styles.createButton} onClick={goToAddRequest}>
                    إنشاء
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>جاري التحميل...</div>
            ) : (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>العنوان</th>
                                    {/* <th>الشروط</th>
                                    <th>المسار</th> */}
                                    <th>العمليات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className={styles.tableRow}>
                                            <td>{req.id}</td>
                                            <td>{req.name}</td>
                                            {/* <td>{Array.isArray(req.requierments) && req.requierments.length > 0 ? (
                                                <span className={styles.requirementsText}>
                                                    {`${req.requierments.length} شروط`}
                                                </span>
                                            ) : "-"}</td>
                                            <td>{Array.isArray(req.steps) && req.steps.length > 0 ? (
                                                <span className={styles.stepsText}>
                                                    {`${req.steps.length} خطوات`}
                                                </span>
                                            ) : "-"}</td> */}
                                            <td className={styles.actions}>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editButton}`}
                                                    onClick={() => goToEditRequest(req.id)}
                                                    title="تعديل"
                                                >
                                                    <FiEdit size={25} />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteButton}`}
                                                    onClick={() => {
                                                        setRequestToDelete(req);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    <FiTrash2 size={25} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className={styles.noData}>لا توجد طلبات</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {showModal && requestToDelete && (
                            <div className={styles.modalStyles}>
                                <div className={styles.modalContentStyles}>
                                    <div className={styles.deleteHead}>
                                        <h5>حذف الطلب</h5>
                                        <button className={styles.close} onClick={() => setShowModal(false)}>
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <p>هل أنت متأكد أنك تريد الحذف؟</p>
                                    <div className={styles.btns}>
                                        <button className={styles.ok} onClick={handleDelete}>تأكيد</button>
                                        <button className={styles.no} onClick={() => setShowModal(false)}>إلغاء</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
