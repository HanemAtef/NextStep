
// import { BrowserRouter } from "react-router-dom";
// import MainDashboard from "./Pages/Dashboards/Maindashboard";
// import './App.css';

// function App() {

//   return (
//     <div className="App">
//       <BrowserRouter>
//         <MainDashboard />
//       </BrowserRouter>
//     </div>
//   )
// }

// export default App;

// App.js
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AppRoutes from "../src/AppRoute/AppRoute"; // استيراد AppRoutes
import Login from "./Pages/Auth/Login/Login"; // استيراد صفحة تسجيل الدخول
import AdminDash from "./Pages/Dashboards/Admin/Dashboard/AdminDash"

import './App.css';

function App() {
  return (
    <Router>
      <AppRoutes />
      {/* <AdminDash /> */}
      {/* <Login /> */}
    </Router>
  );
}

export default App;
