import { useEffect, useState } from "react";
import SearchBar from "../components/SearchbarComponent";
import staffAPI from "../axios/staff";
import projectApi from "../axios/projectAPI";
import { toast } from "react-toastify";
import Pagination from "../components/pagination";
import { 
  User, 
  Mail, 
  Phone, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  ShieldCheck 
} from "lucide-react";

const StaffPage = () => {
  // --- LOGIC XỬ LÝ DỮ LIỆU (GIỮ NGUYÊN) ---
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const fetchStaffs = async (page = 1, keyword = "") => {
    try {
      setLoading(true);
      // Tăng limit lên 9 để lưới hiển thị đẹp hơn
      const res = await staffAPI.getAll(page, keyword, 9);
      
      const staffList = res.data?.data?.staff || [];
      const p = res.data?.data?.pagination || {};

      // Logic lấy project name (giữ lại để dùng trong Form nếu cần, nhưng ẩn ở Card)
      const staffWithProjects = await Promise.all(
        staffList.map(async (s) => {
          if (s.project_id && !s.project) {
            try {
              const proj = await projectApi.getById(s.project_id);
              return { ...s, project: proj.data?.data?.name || null };
            } catch {
              return s;
            }
          }
          return s;
        })
      );

      setStaffs(staffWithProjects);
      setPagination({
        page: p.page || 1,
        totalPages: p.totalPages || 1,
        hasNext: p.hasNext ?? false,
        hasPrev: p.hasPrev ?? false,
      });
    } catch (error) {
      console.error("Failed to fetch staffs:", error);
      toast.error("Could not load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs(pagination.page, search);
  }, [pagination.page, search]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await staffAPI.create(newStaff);
      await fetchStaffs();
      setShowCreateForm(false);
      setNewStaff({ name: "", email: "", password: "", phone: "" });
      toast.success("Staff created successfully!");
    } catch (error) {
      const msg = error.response?.data?.message || "Create failed!";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await staffAPI.delete(editStaff.id);
      await fetchStaffs();
      setEditStaff(null);
      toast.success("Deleted successfully!");
    } catch {
      toast.error("Delete failed!");
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      await staffAPI.update(editStaff.id, editStaff);
      await fetchStaffs();
      setEditStaff(null);
      toast.success("Updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Update failed!");
    }
  };

  // --- GIAO DIỆN (UI) ---
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans text-gray-800">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="text-indigo-600" size={28} /> Staff Management
        </h1>

        {!showCreateForm && !editStaff && (
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <SearchBar value={search} onChange={handleSearchChange} placeholder="Search staff..." />
            </div>
            <button
              onClick={() => { setShowCreateForm(true); setEditStaff(null); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        )}
      </div>

      {/* 2. FORM SECTION (Create / Edit) */}
      {(showCreateForm || editStaff) && (
        <div className="max-w-2xl mx-auto mb-10 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {editStaff ? <Edit3 className="text-indigo-500" size={18}/> : <Plus className="text-indigo-500" size={18}/>}
                {editStaff ? "Edit Profile" : "Add New Staff"}
              </h2>
              <button onClick={() => {setShowCreateForm(false); setEditStaff(null)}} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editStaff ? handleUpdateStaff : handleAddStaff} className="p-6 space-y-5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                    <input className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      value={editStaff ? editStaff.name : newStaff.name}
                      onChange={(e) => editStaff ? setEditStaff({...editStaff, name: e.target.value}) : setNewStaff({...newStaff, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                    <input className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      value={editStaff ? editStaff.phone : newStaff.phone}
                      onChange={(e) => editStaff ? setEditStaff({...editStaff, phone: e.target.value}) : setNewStaff({...newStaff, phone: e.target.value})}
                    />
                  </div>
               </div>

               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <input className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    value={editStaff ? editStaff.email : newStaff.email}
                    onChange={(e) => editStaff ? setEditStaff({...editStaff, email: e.target.value}) : setNewStaff({...newStaff, email: e.target.value})}
                    required
                  />
               </div>

               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Password</label>
                  <input type="password" className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    placeholder={editStaff ? "Leave empty to keep current" : "Required"}
                    value={editStaff ? (editStaff.password || "") : newStaff.password}
                    onChange={(e) => editStaff ? setEditStaff({...editStaff, password: e.target.value}) : setNewStaff({...newStaff, password: e.target.value})}
                    required={!editStaff}
                  />
               </div>

               <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-4">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium flex justify-center gap-2 shadow-md">
                    <Save size={18} /> Save
                  </button>
                  {editStaff && (
                    <button type="button" onClick={handleDelete} className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg flex items-center gap-2">
                      <Trash2 size={18} /> Delete
                    </button>
                  )}
                  <button type="button" onClick={() => {setShowCreateForm(false); setEditStaff(null)}} className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg">
                    Cancel
                  </button>
               </div>
            </form>
        </div>
      )}

      {/* 3. LIST SECTION (TỐI GIẢN) */}
      {!showCreateForm && !editStaff && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse"></div>)}
            </div>
          ) : staffs.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <User size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No staff members found.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffs.map((staff) => (
                <div
                  key={staff.id}
                  onClick={() => { setEditStaff(staff); setShowCreateForm(false); }}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-400 cursor-pointer transition-all group"
                >
                  {/* Header: Avatar & Tên */}
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {staff.name.charAt(0).toUpperCase()}
                     </div>
                     <h3 className="font-bold text-gray-900 truncate">{staff.name}</h3>
                  </div>

                  {/* Body: Email & SĐT */}
                  <div className="space-y-2 text-sm text-gray-500 pl-1">
                    <div className="flex items-center gap-2 truncate">
                        <Mail size={14} className="text-gray-400 shrink-0"/> 
                        <span className="truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400 shrink-0"/> 
                        <span>{staff.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && staffs.length > 0 && (
            <div className="mt-8 flex justify-center">
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
  );
};

export default StaffPage;