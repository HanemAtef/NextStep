import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistory } from "../../Redux/slices/historySlice";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import HistoryCSS from "./History.module.css";

const History = ({ request }) => {
  const dispatch = useDispatch();
  const {
    data: history,
    loading,
    error,
  } = useSelector((state) => state.history);

  useEffect(() => {
    if (request?.id) {
      dispatch(fetchHistory(request.id));
    }
  }, [dispatch, request]);

  if (loading) return <p>جاري تحميل البيانات...</p>;
  if (error) return <p>حدث خطأ: {error}</p>;
  if (!history || !Array.isArray(history) || history.length === 0) {
    return <p>لا يوجد تاريخ لهذا الطلب</p>;
  }

  return (
    <div>
      <div className={HistoryCSS.historyy}>
        <h3 className={HistoryCSS.histTitle}>
          <span className={HistoryCSS.penIcon}>🖊</span> تاريخ مسار الطلب
        </h3>
        <div className={HistoryCSS.historyCardd}>
          {history.map((item, index) => (
            <div key={index} className={HistoryCSS.historyItem}>
              <Card className={HistoryCSS.cardWrapper}>
                <Card.Header className={HistoryCSS.cardTitlee}>
                  {item.department || "قسم غير محدد"}
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item className={HistoryCSS.cardItem}>
                    <strong>الإجراء:</strong> {item.action || "لا يوجد إجراء"}
                  </ListGroup.Item>
                  <ListGroup.Item className={HistoryCSS.cardItem}>
                    <strong>تاريخ الدخول:</strong>{" "}
                    {item.inDate
                      ? new Date(item.inDate).toLocaleDateString()
                      : "غير محدد"}
                  </ListGroup.Item>
                  <ListGroup.Item className={HistoryCSS.cardItem}>
                    <strong>تاريخ الخروج:</strong>{" "}
                    {item.outDate
                      ? new Date(item.outDate).toLocaleDateString()
                      : "غير محدد"}
                  </ListGroup.Item>
                  <ListGroup.Item className={HistoryCSS.cardItem}>
                    <strong>ملاحظات:</strong> {item.notes || "لا توجد ملاحظات"}
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
