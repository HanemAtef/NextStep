import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditRequest.module.css';
import { FaArrowRight, FaSave, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchrequestById, updaterequest, setError, clearError } from '../../../../../Redux/slices/requestSlice';

const EditRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentrequest, loading, error } = useSelector(state => state.requestAdmin);

  const departments = [
    { id: 1, name: "مجلس الكليه" },
    { id: 2, name: "لجنه الدرسات العليا" },
    { id: 3, name: "حسابات علميه" },
    { id: 4, name: "ذكاء اصطناعي" },
    { id: 5, name: "علوم حاسب" },
    { id: 6, name: "نظم المعلومات" },
    { id: 7, name: "إدارة الدرسات العليا" }
  ];

  const [request, setRequest] = useState({
    id: '',
    name: '',
    description: '',
    requierments: [],
    steps: [],
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchrequestById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentrequest) {
      console.log("بيانات الطلب:", currentrequest);
      setRequest({
        id: currentrequest.id || '',
        description: currentrequest.description || '',
        name: currentrequest.name || '',
        requierments: Array.isArray(currentrequest.requierments)
          ? currentrequest.requierments.map(req => req.name || '')
          : [],
        steps: Array.isArray(currentrequest.steps)
          ? currentrequest.steps.map(step => ({
            id: step.id || '',
            departmentId: step.departmentId || '',
            stepOrder: step.stepOrder || ''
          }))
          : [],
      });
    }
  }, [currentrequest]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequest(prevRequest => ({
      ...prevRequest,
      [name]: value
    }));
  };

  const handleRequirementsChange = (e, index) => {
    const newRequirements = [...request.requierments];
    newRequirements[index] = e.target.value;
    setRequest(prevRequest => ({
      ...prevRequest,
      requierments: newRequirements
    }));
  };

  const addRequirement = () => {
    setRequest(prevRequest => ({
      ...prevRequest,
      requierments: [...prevRequest.requierments, '']
    }));
  };

  const removeRequirement = (index) => {
    const newRequirements = [...request.requierments];
    newRequirements.splice(index, 1);
    setRequest(prevRequest => ({
      ...prevRequest,
      requierments: newRequirements
    }));
  };

  const handleStepChange = (e, index, field) => {
    const newSteps = [...request.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: e.target.value
    };
    setRequest(prevRequest => ({
      ...prevRequest,
      steps: newSteps
    }));
  };

  const addStep = () => {
    setRequest(prevRequest => ({
      ...prevRequest,
      steps: [...prevRequest.steps, { departmentId: '', stepOrder: prevRequest.steps.length + 1 }]
    }));
  };

  const removeStep = (index) => {
    const newSteps = [...request.steps];
    newSteps.splice(index, 1);
    // Update stepOrder for remaining steps
    for (let i = index; i < newSteps.length; i++) {
      newSteps[i].stepOrder = i + 1;
    }
    setRequest(prevRequest => ({
      ...prevRequest,
      steps: newSteps
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (request.steps.some(step => !step.departmentId)) {
      dispatch(setError('لا يمكن أن تكون هناك خطوات بدون قسم في مسار سير الطلب'));
      return;
    }

    const formattedRequest = {
      id: Number(request.id),
      applicationTypeName: request.name.trim(),
      description: (request.description || '').trim(),
      steps: request.steps.map(step => ({
        departmentId: Number(step.departmentId),
        stepOrder: Number(step.stepOrder)
      })),
      requierments: request.requierments.map(req => ({
        requiermentName: req.trim()
      }))
    };

    console.log("🚀 البيانات المرسلة:", formattedRequest);

    dispatch(updaterequest(formattedRequest));
    navigate('/admin/requests');
  };

  const goBack = () => {
    navigate('/admin/requests');
  };

  if (loading) {
    return <div className={styles.loading}>جاري تحميل البيانات...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>تعديل نوع طلب</h2>
        <button onClick={goBack} className={styles.backButton}>
          <FaArrowRight /> العودة للقائمة
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">عنوان الطلب</label>
          <input
            type="text"
            id="title"
            name="name"
            value={request.name}
            onChange={handleChange}
            required
            className={styles.formControl}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="createdAt"> الوصف</label>
          <input
            type="text"
            id="description"
            name="description"
            value={request.description}
            onChange={handleChange}
            className={styles.formControl}
          />
        </div>

        <div className={styles.formGroup}>
          <label>شروط الطلب</label>
          <div className={styles.pathContainer}>
            {request.requierments.map((requirement, index) => (
              <div key={index} className={styles.pathStep}>
                <textarea
                  value={requirement}
                  onChange={(e) => handleRequirementsChange(e, index)}
                  className={styles.formControl}
                  required
                  placeholder="أدخل شرط الطلب"
                  rows="2"
                ></textarea>
                <button
                  type="button"
                  className={styles.removeStepButton}
                  onClick={() => removeRequirement(index)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addStepButton}
              onClick={addRequirement}
            >
              + إضافة شرط جديد
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>مسار سير الطلب</label>
          <div className={styles.tableContainer}>
            <table className={styles.stepsTable}>
              <thead>
                <tr>
                  <th>القسم</th>
                  <th>ترتيب الخطوة</th>
                  <th className={styles.actionColumn}></th>
                </tr>
              </thead>
              <tbody>
                {request.steps.map((step, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={step.departmentId}
                        onChange={(e) => handleStepChange(e, index, 'departmentId')}
                        className={styles.tableInput}
                        required
                      >
                        <option value="">اختر القسم</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={step.stepOrder}
                        onChange={(e) => handleStepChange(e, index, 'stepOrder')}
                        className={styles.tableInput}
                        required
                        placeholder="الترتيب"
                      />
                    </td>
                    <td className={styles.actionColumn}>
                      <button
                        type="button"
                        className={styles.removeStepButton}
                        onClick={() => removeStep(index)}
                        disabled={request.steps.length <= 1}
                      >
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className={styles.addStepButton}
              onClick={addStep}
            >
              + إضافة خطوة جديدة
            </button>
          </div>
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

export default EditRequest;



