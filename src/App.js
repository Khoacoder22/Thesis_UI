import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./page/Login";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./page/DashboardPage";
import ProjectPage from "./page/ProjectPage";
import UserPage from "./page/UserPage";

const Layout = () => {
  const location = useLocation();

  // Ẩn sidebar khi ở trang login
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
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;
