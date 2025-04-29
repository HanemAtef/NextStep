import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import styles from "./CreateReq.module.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { updateField, resetForm } from "../../../Redux/slices/applicationSlice";

function CreateReq() {
    const [applicationTypes, setApplicationTypes] = useState([]);
    const [studentIdError, setStudentIdError] = useState("");
    const [fileName, setFileName] = useState("");

    const dispatch = useDispatch();
    const formData = useSelector((state) => state.application.formData);


    useEffect(() => {
        const savedFormData = sessionStorage.getItem("createFormData");
        if (savedFormData) {
            const parsedData = JSON.parse(savedFormData);
            Object.entries(parsedData).forEach(([field, value]) => {
                dispatch(updateField({ field, value }));
            });
        }
    }, [dispatch]);


    useEffect(() => {
        sessionStorage.setItem("createFormData", JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        const fetchApplicationTypes = async () => {
            try {
                const response = await axios.get("https://api.example.com/application-types");
                setApplicationTypes(response.data);
            } catch (error) {
                console.error("Error fetching application types:", error);
                setApplicationTypes([
                    "طلب التحاق",
                    "طلب مد",
                    "طلب إلغاء تسجيل",
                    "طلب إعلان سيمنار",
                    "طلب عقد سيمنار أول",
                    "طلب تشكيل لجنة حكم ومناقشة",
                    "طلب عقد سيمنار صلاحية",
                    "طلب عقد سيمنار مناقشة",
                    "طلب منح",
                ]);
            }
        };

        fetchApplicationTypes();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            dispatch(updateField({ field: "attachment", value: file }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("تم الإرسال", formData);
        dispatch(resetForm());
        sessionStorage.removeItem("createFormData");
        setFileName("");
        e.target.reset();
    };

    const handleCancel = () => {
        dispatch(resetForm());
        sessionStorage.removeItem("createFormData");
        setFileName("");
        setStudentIdError("");
    };

    return (
        <div className={styles.createPageWrapper}>
            <div className={styles.mainContent}>
                <h4 className={styles.title}>
                    <FaPlus className={styles.iconn} /> إنشاء طلب
                </h4>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="applicationType" className={styles.formLabel}>نوع الطلب</label>
                            <select
                                id="applicationType"
                                className={styles.formSelect}
                                value={formData.applicationType || ""}
                                onChange={(e) =>
                                    dispatch(updateField({ field: "applicationType", value: e.target.value }))
                                }
                            >
                                <option value="">اختر نوع الطلب</option>
                                {applicationTypes.map((type, i) => (
                                    <option key={i} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="studentId" className={styles.formLabel}>الرقم الجامعي</label>
                            <input
                                type="text"
                                id="studentId"
                                className={styles.formControl}
                                value={formData.studentId || ""}
                                maxLength={12}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (/^\d*$/.test(v)) {
                                        dispatch(updateField({ field: "studentId", value: v }));
                                        setStudentIdError("");
                                    } else {
                                        setStudentIdError("الرجاء إدخال أرقام فقط");
                                    }
                                }}
                            />
                            {studentIdError && <div className={styles.errorText}>{studentIdError}</div>}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="studentName" className={styles.formLabel}>اسم الطالب</label>
                            <input
                                type="text"
                                id="studentName"
                                className={styles.formControl}
                                value={formData.studentName || ""}
                                onChange={(e) =>
                                    dispatch(updateField({ field: "studentName", value: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="studentPhone" className={styles.formLabel}>رقم الهاتف</label>
                            <input
                                type="text"
                                id="studentPhone"
                                className={styles.formControl}
                                value={formData.studentPhone || ""}
                                onChange={(e) =>
                                    dispatch(updateField({ field: "studentPhone", value: e.target.value }))
                                }
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="uploadAttachment" className={styles.formLabel}>إرفاق ملف</label>
                            <input
                                type="file"
                                id="uploadAttachment"
                                className={styles.formFileInput}
                                onChange={handleFileChange}
                            />
                            {fileName && <div className={styles.successText}>تم اختيار الملف: {fileName}</div>}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="notes" className={styles.formLabel}>ملاحظات</label>
                        <textarea
                            id="notes"
                            className={styles.formTextarea}
                            rows={2}
                            value={formData.notes || ""}
                            onChange={(e) =>
                                dispatch(updateField({ field: "notes", value: e.target.value }))
                            }
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={handleCancel}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className={styles.btnCreate}
                        >
                            إرسال
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateReq;