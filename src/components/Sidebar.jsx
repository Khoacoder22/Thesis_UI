import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Users, ChevronLeft, ChevronRight, LogOut } from "lucide-react";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy user từ localStorage khi component mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const menus = [
    { title: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/dashboard" },
    { title: "Project", icon: <FolderKanban size={22} />, path: "/project" },
    { title: "User", icon: <Users size={22} />, path: "/user" },
  ];

  const handleLogout = () => {
    // Xóa token localStorage nếu có
    localStorage.removeItem("token");

    // Chuyển hướng về trang login
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen ${
        open ? "w-64" : "w-20"
      } bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 flex flex-col justify-between text-white shadow-xl transition-all duration-300`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between h-20 border-b border-white/30 px-4">
          {open && <h1 className="text-2xl font-extrabold tracking-wide">Super Admin</h1>}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full hover:bg-white/20 transition"
          >
            {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Menu */}
        <ul className="mt-6 space-y-2 px-3">
          {menus.map((menu) => (
            <li key={menu.title}>
              <NavLink
                to={menu.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                    isActive ? "bg-white/30 shadow-md" : "hover:bg-white/10"
                  }`
                }
              >
                {menu.icon}
                {open && <span className="text-base font-medium">{menu.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout + User Info */}
      <div>
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-5 py-3 text-white/90 hover:bg-white/20 transition-all border-t border-white/30"
        >
          <LogOut size={20} />
          {open && <span className="font-medium text-sm">Logout</span>}
        </button>

        {/* User Info */}
        <div className="p-5 border-t border-white/30 flex items-center gap-3">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR81iX4Mo49Z3oCPSx-GtgiMAkdDop2uVmVvw&s"
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-2 border-white"
          />
           {open && (
            <div>
              <h3 className="font-semibold text-sm">
                {user ? user.name : "Guest"}
              </h3>
              <p className="text-xs text-white/80">
                {user ? user.role || "User" : ""}
          </p>
        </div>
  )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
