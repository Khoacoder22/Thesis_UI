import React, { useEffect, useState, useRef } from "react";
import SearchBar from "../components/SearchbarComponent";
import userApi from "../axios/userAPI";
import projectApi from "../axios/projectAPI";
import { toast } from "react-toastify";
import Pagination from "../components/pagination";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  ShieldCheck,
  Search,
  Filter
} from "lucide-react";

const UserPage = () => {
  // --- STATE ---
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // "" = All, "admin", "staff"
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [projectSearch, setProjectSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const dropdownRef = useRef(null);

  // --- FETCH USERS (with role filter) ---
  const fetchUsers = async (page = 1, keyword = "", role = "") => {
    setLoading(true);
    try {
      const res = await userApi.getAll(page, keyword, 8, role);

      let usersList = res.data?.data || [];

      usersList = await Promise.all(
        usersList.map(async (u) => {
          if (u.project_id && !u.project) {
            try {
              const p = await projectApi.getById(u.project_id);
              return { ...u, project: p.data?.data?.name || null };
            } catch {
              return u;
            }
          }
          return u;
        })
      );

      setUsers(usersList);

      if (res.data?.pagination) {
        const p = res.data.pagination;
        setPagination({
          page: p.page || 1,
          totalPages: p.totalPages || 1,
          hasNext: p.hasNext ?? false,
          hasPrev: p.hasPrev ?? false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page, search, roleFilter);
  }, [pagination.page, search, roleFilter]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // --- PROJECT DROPDOWN ---
  const loadProjects = async () => {
    try {
      const res = await projectApi.getUnassigned(projectSearch);
      setAllProjects(res.data?.data?.projects || []);
    } catch (err) {
      console.log("LOAD PROJECTS ERROR:", err);
    }
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const t = setTimeout(loadProjects, 250);
    return () => clearTimeout(t);
  }, [projectSearch, dropdownOpen]);

  // --- CRUD OPERATIONS ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await userApi.createAdmin(newUser);
      await fetchUsers();
      setShowCreateForm(false);
      setNewUser({ name: "", email: "", password: "", phone: "" });
      toast.success("Created successfully!");
    } catch (error) {
      const msg = error.response?.data?.message || "Create failed!";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await userApi.deleteUser(editUser.id);
      await fetchUsers();
      setEditUser(null);
      toast.success("Deleted!");
    } catch {
      toast.error("Delete failed!");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await userApi.update(editUser.id, editUser);
      if (selectedProject) {
        await projectApi.assignToUser(editUser.id, selectedProject.name);
      }
      await fetchUsers();
      setEditUser(null);
      toast.success("Updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      const errorMsg = err.response?.data?.message;
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // --- UI COMPONENTS ---
  const UserSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-2.5 bg-gray-100 rounded w-full"></div>
        <div className="h-2.5 bg-gray-100 rounded w-3/4"></div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-1/3 mt-3"></div>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-50/50 min-h-screen font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={24} /> Admins
            </h1>
            <p className="text-gray-500 text-xs mt-1">Manage administrators and permissions.</p>
          </div>

          {!showCreateForm && !editUser && (
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="w-full sm:w-64">
                <SearchBar value={search} onChange={handleSearchChange} />
              </div>
              
              {/* Filter Role */}
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-white"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
              
              <button
                onClick={() => { setShowCreateForm(true); setEditUser(null); }}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-indigo-200 transition-all active:scale-95 text-sm"
              >
                <Plus size={18} /> Add Admin
              </button>
            </div>
          )}
        </div>

        {/* FORM SECTION (Clean Style) */}
        {(showCreateForm || editUser) && (
          <div className="max-w-2xl mx-auto mb-8 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                {editUser ? <Edit3 className="text-indigo-600" size={18}/> : <Plus className="text-indigo-600" size={18}/>}
                {editUser ? "Edit Admin Profile" : "New Admin Account"}
              </h2>
              <button onClick={() => {setShowCreateForm(false); setEditUser(null)}} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editUser ? handleUpdateUser : handleAddUser} className="p-6 space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                      value={editUser ? editUser.name : newUser.name}
                      onChange={(e) => editUser ? setEditUser({...editUser, name: e.target.value}) : setNewUser({...newUser, name: e.target.value})}
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                      value={editUser ? editUser.phone : newUser.phone}
                      onChange={(e) => editUser ? setEditUser({...editUser, phone: e.target.value}) : setNewUser({...newUser, phone: e.target.value})}
                      placeholder="Enter phone"
                    />
                  </div>
               </div>

               <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                    value={editUser ? editUser.email : newUser.email}
                    onChange={(e) => editUser ? setEditUser({...editUser, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})}
                    placeholder="admin@example.com"
                  />
               </div>

               <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Password</label>
                  <input type="password" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                    placeholder={editUser ? "Leave empty to keep current" : "Required"}
                    value={editUser ? (editUser.password || "") : newUser.password}
                    onChange={(e) => editUser ? setEditUser({...editUser, password: e.target.value}) : setNewUser({...newUser, password: e.target.value})}
                  />
               </div>

               {/* Project Dropdown */}
               {editUser && (
                 <div className="relative" ref={dropdownRef}>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Assign Project</label>
                    <div className="relative">
                      <input className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm pr-10"
                        placeholder="Search Project..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        onFocus={() => setDropdownOpen(true)}
                      />
                      <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                    </div>

                    {dropdownOpen && (
                      <ul className="absolute z-50 bg-white border border-gray-100 rounded-lg w-full max-h-40 overflow-y-auto shadow-lg mt-1">
                        {allProjects.length > 0 ? allProjects.map((p) => (
                          <li key={p.id} className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700"
                            onClick={() => {
                              setSelectedProject(p);
                              setProjectSearch(p.name);
                              setDropdownOpen(false);
                            }}
                          >
                            {p.name}
                          </li>
                        )) : (
                          <li className="px-3 py-2 text-xs text-gray-400 italic">No unassigned projects</li>
                        )}
                      </ul>
                    )}
                 </div>
               )}

               <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-50">
                  <button type="button" onClick={() => {setShowCreateForm(false); setEditUser(null)}} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                    Cancel
                  </button>
                  {editUser && (
                    <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-medium flex items-center gap-2">
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                  <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md flex items-center gap-2">
                    <Save size={16} /> Save
                  </button>
               </div>
            </form>
          </div>
        )}

        {/* CONTENT SECTION */}
        {!showCreateForm && !editUser && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <UserSkeleton key={n} />)}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
                 <div className="bg-indigo-50 p-3 rounded-full mb-3">
                   <User size={32} className="text-indigo-400" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-800">No admins found</h3>
                 <p className="text-gray-500 mt-1 mb-4 max-w-xs text-sm">Adjust search or add a new admin.</p>
                 <button
                    onClick={() => { setShowCreateForm(true); setEditUser(null); }}
                    className="text-indigo-600 font-medium hover:underline text-sm"
                  >
                    Add first admin
                  </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => { setEditUser(user); setShowCreateForm(false); }}
                    className="group relative bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                  >
                    {/* Decorative Icon Box */}
                    <div className="mb-3 flex justify-between items-start">
                       <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <span className="font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                       </div>
                       <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600">
                          <Edit3 size={16} />
                       </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {user.name}
                      </h3>
                      <div className="text-xs text-gray-500 space-y-1">
                         <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-gray-400"/> 
                            <span className="truncate">{user.email}</span>
                         </div>
                         {user.phone && (
                           <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-gray-400"/> 
                              <span>{user.phone}</span>
                           </div>
                         )}
                      </div>
                    </div>

                    {/* Footer Compact */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded max-w-full">
                        <Briefcase size={10} />
                        <span className="truncate font-medium">
                           {user.project ? (user.project.name ?? user.project) : "No Project"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && users.length > 0 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  hasPrev={pagination.hasPrev}
                  hasNext={pagination.hasNext}
                  onPrev={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  onNext={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserPage;