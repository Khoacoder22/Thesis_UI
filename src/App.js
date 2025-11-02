import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./page/Login";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./page/DashboardPage";
import ProjectPage from "./page/ProjectPage";
import UserPage from "./page/UserPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = () => {
  const location = useLocation();

  //  login
  const hideSidebar = location.pathname === "/login";

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 bg-gray-50 min-h-screen">

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </Router>
  );
};

export default App;
