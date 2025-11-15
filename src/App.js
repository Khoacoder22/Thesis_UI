import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./page/Login";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./page/DashboardPage";
import ProjectPage from "./page/ProjectPage";
import UserPage from "./page/UserPage";
import Service from "./page/Service";
import { ToastContainer } from "react-toastify";
import Staff from "./page/Staff";
import Profile from "./page/profile";
import TicketPage from "./page/ticketPage";
import Store from "./page/Store";
import TicketDetail from "./page/TicketDetail";
import TicketForm from "./page/TicketForm";
import LinePage from "./page/linePage";
import "react-toastify/dist/ReactToastify.css";

const Layout = () => {
  const location = useLocation();

  // danh sách các route muốn ẩn sidebar
  const pathsWithoutSidebar = [
    "/login",
    "/projects/:slug",
    "/services/:serviceId",
    "/ticket/:ticketId"
  ];

  const hideSidebar = pathsWithoutSidebar.some((path) => {
    if (!path.includes(":")) {
      // static path
      return location.pathname === path;
    } else {
      // dynamic path: check base path trước dấu ":"
      const basePath = path.split("/:")[0];
      return location.pathname.startsWith(basePath) && location.pathname !== "/tickets";
    }
  });

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <Routes>
          {/* Static routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/service" element={<Service />} />
          <Route path="/tickets" element={<TicketPage />} />
          <Route path="/line" element={<LinePage />} />

          {/* Dynamic routes */}
          <Route path="/projects/:slug" element={<Store />} />
          <Route path="/services/:serviceId" element={<TicketForm />} />
          <Route path="/ticket/:ticketId" element={<TicketDetail />} />
        </Routes>
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
