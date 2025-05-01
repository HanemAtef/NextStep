
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationDetails } from "../../Redux/slices/detailsSlice";
import { downloadApplicationFile } from "../../Redux/slices/downloadSlice";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import DetailsCSS from "./Details.module.css";
import { useParams } from "react-router-dom";

const Details = ({ id }) => {
  const { id: urlId } = useParams();
  const dispatch = useDispatch();
  const [lastFetchedId, setLastFetchedId] = useState(null);

  // Use URL ID as fallback if prop ID is not provided
  const effectiveId = id || urlId;

  // console.log("Details Component - Prop ID:", id);
  // console.log("Details Component - URL ID:", urlId);
  // console.log("Details Component - Effective ID being used:", effectiveId);

  const {
    data: request,
    loading,
    error,
  } = useSelector((state) => state.details);
  const { loading: downloadLoading } = useSelector((state) => state.download);

  const handleDownload = () => {
    if (effectiveId) {
      dispatch(downloadApplicationFile({ id: effectiveId }));
    }
  };

  useEffect(() => {
    if (effectiveId && effectiveId !== lastFetchedId) {
      console.log("Details Component - Fetching details with ID:", effectiveId);
      dispatch(fetchApplicationDetails(effectiveId));
      setLastFetchedId(effectiveId);
    }
  }, [dispatch, effectiveId, lastFetchedId]);

  if (!effectiveId) {
    return (
      <div className={DetailsCSS.container}>
        <Card className={DetailsCSS.cardsContainerr}>
          <Card.Header className={DetailsCSS.cardTitlee}>
            <h5>بيانات الطلب</h5>
          </Card.Header>
          <ListGroup>
            <ListGroup.Item className={DetailsCSS.infoRow}>
              <div className={DetailsCSS.infovalue}>
                لا يمكن عرض البيانات: لم يتم توفير معرف صالح للطلب
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={DetailsCSS.container}>
        <Card className={DetailsCSS.cardsContainerr}>
          <Card.Header className={DetailsCSS.cardTitlee}>
            <h5>بيانات الطلب</h5>
          </Card.Header>
          <ListGroup>
            <ListGroup.Item className={DetailsCSS.infoRow}>
              <div className={DetailsCSS.infovalue}>جاري تحميل البيانات...</div>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={DetailsCSS.container}>
        <Card className={DetailsCSS.cardsContainerr}>
          <Card.Header className={DetailsCSS.cardTitlee}>
            <h5>خطأ</h5>
          </Card.Header>
          <ListGroup>
            <ListGroup.Item className={DetailsCSS.infoRow}>
              <div className={DetailsCSS.infovalue}>
                {error.includes("لم يتم العثور على رمز المصادقة") ||
                error.includes("انتهت صلاحية الجلسة") ? (
                  <div className={DetailsCSS.errorContainer}>
                    <p>{error}</p>
                    <button
                      onClick={() => {
                        // Clear any existing token
                        sessionStorage.removeItem("token");
                        // Redirect to login
                        window.location.href = "/login";
                      }}
                      className={DetailsCSS.loginButton}
                    >
                      تسجيل الدخول
                    </button>
                  </div>
                ) : (
                  error
                )}
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className={DetailsCSS.container}>
        <Card className={DetailsCSS.cardsContainerr}>
          <Card.Header className={DetailsCSS.cardTitlee}>
            <h5>بيانات الطلب</h5>
          </Card.Header>
          <ListGroup>
            <ListGroup.Item className={DetailsCSS.infoRow}>
              <div className={DetailsCSS.infovalue}>لا توجد بيانات</div>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </div>
    );
  }

  return (
    <div className={DetailsCSS.container}>
      <Card className={DetailsCSS.cardsContainerr}>
        <Card.Header className={DetailsCSS.cardTitlee}>
          <h5>{request.applicationName || "بيانات الطلب"}</h5>
        </Card.Header>
        <ListGroup>
          <ListGroup.Item className={DetailsCSS.infoRow}>
            <div className={DetailsCSS.infolabel}>رقم الطلب</div>
            <div className={DetailsCSS.infovalue}>
              {request.applicationId || effectiveId}
            </div>
          </ListGroup.Item>
          <ListGroup.Item className={DetailsCSS.infoRow}>
            <div className={DetailsCSS.infolabel}>اسم الطالب</div>
            <div className={DetailsCSS.infovalue}>
              {request.studentName || "غير محدد"}
            </div>
          </ListGroup.Item>
          <ListGroup.Item className={DetailsCSS.infoRow}>
            <div className={DetailsCSS.infolabel}>الرقم القومي</div>
            <div className={DetailsCSS.infovalue}>
              {request.studentNId || "غير محدد"}
            </div>
          </ListGroup.Item>
          <ListGroup.Item className={DetailsCSS.infoRow}>
            <div className={DetailsCSS.infolabel}>الادارة المرسل منها</div>
            <div className={DetailsCSS.infovalue}>
              {request.createdDepartment || "غير محدد"}
            </div>
          </ListGroup.Item>
          <ListGroup.Item className={DetailsCSS.infoRow}>
            <div className={DetailsCSS.infolabel}>الحالة</div>
            <div className={DetailsCSS.infovalue}>
              {request.statue || "غير محدد"}
            </div>
          </ListGroup.Item>
          <ListGroup.Item className={DetailsCSS.infoRow}>
            <div className={DetailsCSS.infolabel}>تاريخ الإنشاء</div>
            <div className={DetailsCSS.infovalue}>
              {request.createdDate
                ? new Date(request.createdDate).toLocaleDateString()
                : "غير محدد"}
            </div>
          </ListGroup.Item>
          <ListGroup.Item className={DetailsCSS.infoRow}>
            <div className={DetailsCSS.infolabel}>تحميل ملف</div>
            <div className={DetailsCSS.infovalue}>
              <button
                className={DetailsCSS.downloadbtn}
                onClick={handleDownload}
                disabled={downloadLoading}
              >
                {downloadLoading ? "جاري التحميل..." : "تحميل الملف"}
              </button>
            </div>
          </ListGroup.Item>
        </ListGroup>
      </Card>
    </div>
  );
};

export default Details;
