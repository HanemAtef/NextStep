// import React from "react";
// import Card from "react-bootstrap/Card";
// import ListGroup from "react-bootstrap/ListGroup";
// import HistoryCSS from "./History.module.css";
// const History = ({ request, onBack }) => {
//   const applicationData = {
//     description: "طلب الالتحاق",
//     document: "Document.pdf",
//     history: [
//       {
//         department: "ادارة الدراسات العليا",
//         action: "انشات الطلب",
//         date: "فبراير",
//         note: "طلب الالتحاق مستوفي الشروط",
//       },
//       {
//         department: "القسم العلمي",
//         action: "وافقت علي الطلب",
//         date: "فبراير",
//         note: "طلب الالتحاق مستوفي الشروط",
//       },
//     ],
//   };

//   return (
//     <div>
//       <div className={HistoryCSS.historyy}>
//         <h3 className={HistoryCSS.histTitle}>
//           <span className={HistoryCSS.penIcon}>🖊️</span> تاريخ مسار الطلب
//         </h3>
//         <div className={HistoryCSS.historyCardd}>
//           {applicationData.history.map((item, index) => (
//             <div key={index} className={HistoryCSS.historyItem}>
//               <Card >
//                 <Card.Header className={HistoryCSS.cardTitlee}>
//                   <h4>{item.department}</h4>
//                 </Card.Header>
//                 <ListGroup variant="flush">
//                   <ListGroup.Item className={HistoryCSS.cardItem}>
//                     <strong>الإجراء:</strong>
//                     {item.action}
//                   </ListGroup.Item>
//                   <ListGroup.Item className={HistoryCSS.cardItem}>
//                     <strong>التاريخ:</strong> {item.date}
//                   </ListGroup.Item>
//                   <ListGroup.Item className={HistoryCSS.cardItem}>
//                     <strong>ملاحظات:</strong>
//                     {item.note}
//                   </ListGroup.Item>
//                 </ListGroup>
//               </Card>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default History;

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
              <Card>
                <Card.Header className={HistoryCSS.cardTitlee}>
                  <h4>{item.department || "قسم غير محدد"}</h4>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item className={HistoryCSS.cardItem}>
                    <strong>الإجراء:</strong> {item.action || "لا يوجد إجراء"}
                  </ListGroup.Item>
                  <ListGroup.Item className={HistoryCSS.cardItem}>
                    <strong>التاريخ:</strong>{" "}
                    {item.actionDate
                      ? new Date(item.actionDate).toLocaleDateString()
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
