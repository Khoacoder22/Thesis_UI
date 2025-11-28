import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  Layers, 
  Edit3, 
  Search 
} from "lucide-react"; // Import icon
import SearchBar from "../components/SearchbarComponent";
import ProjectForm from "../components/ProjectForm";
import projectApi from "../axios/projectAPI";
import Pagination from "../components/pagination";

const ProjectPage = () => {
  // --- GIỮ NGUYÊN LOGIC GỐC ---
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    fetchProjects(pagination.page, search);
  }, [pagination.page, search]);

  const fetchProjects = async (page = 1, keyword = "") => {
    setLoading(true);
    try {
      const res = await projectApi.getAll(page, keyword);
      const data = res.data;

      setProjects(data.data || []);
      setPagination({
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 1,
        hasNext: data.pagination?.hasNext || false,
        hasPrev: data.pagination?.hasPrev || false,
      });
    } catch (err) {
      console.error("Fetch projects error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Your session expired. Please login again!");
      } else {
        toast.error("Failed to load projects!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warn("Please enter project name!");
      return;
    }

    try {
      if (editMode) {
        await projectApi.update(editId, formData);
        toast.success("Project updated successfully!");
      } else {
        await projectApi.create(formData);
        toast.success("Project created successfully!");
      }
      fetchProjects(pagination.page, search);
    } catch (err) {
      console.error("Save error:", err);
      const message = err.response?.data?.message || "Failed to save project!";
      toast.error(message);
    }
  };

  const handleEditClick = (project) => {
    setEditMode(true);
    setEditId(project.id);
    setFormData({ name: project.name, description: project.description });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!editId) {
      toast.error("Project ID is missing!");
      return;
    }
    try {
      await projectApi.delete(editId);
      toast.success("Project deleted successfully!");
      fetchProjects(pagination.page, search);
      setShowForm(false);
      setEditMode(false);
      setEditId(null);
    } catch (err) {
      console.error("Delete error:", err);
      const message = err.response?.data?.message || "Failed to delete project!";
      toast.error(message);
    }
  };

  // --- UI HELPER COMPONENTS ---

  // Skeleton Loading Card (Đã thu nhỏ kích thước)
  const ProjectSkeleton = () => (
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

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-50/50 min-h-screen font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={24} /> Projects
            </h1>
            <p className="text-gray-500 text-xs mt-1">Manage and track your ongoing projects.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64">
               <SearchBar 
                  value={search} 
                  onChange={(val) => { setSearch(val); setPagination((prev) => ({ ...prev, page: 1 })); }} 
               />
            </div>
            <button
              onClick={() => {
                setEditMode(false);
                setFormData({ name: "", description: "" });
                setShowForm(true);
              }}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-indigo-200 transition-all active:scale-95 text-sm"
            >
              <Plus size={18} /> New Project
            </button>
          </div>
        </div>

        {/* CONTENT SECTION */}
        {loading ? (
          // Grid Compact hơn: gap-4 thay vì gap-6
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <ProjectSkeleton key={n} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
             <div className="bg-indigo-50 p-3 rounded-full mb-3">
               <Layers size={32} className="text-indigo-400" />
             </div>
             <h3 className="text-lg font-bold text-gray-800">No projects found</h3>
             <p className="text-gray-500 mt-1 mb-4 max-w-xs text-sm">Adjust your search or create a new project to get started.</p>
             <button
                onClick={() => { setEditMode(false); setFormData({ name: "", description: "" }); setShowForm(true); }}
                className="text-indigo-600 font-medium hover:underline text-sm"
              >
                Create your first project
              </button>
          </div>
        ) : (
          // Grid Compact: gap-4
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => handleEditClick(p)}
                // Card Compact: p-4, rounded-xl
                className="group relative bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                {/* Decorative Icon Compact */}
                <div className="mb-3 flex justify-between items-start">
                   <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Layers size={16} />
                   </div>
                   <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600">
                      <Edit3 size={16} />
                   </span>
                </div>

                <div className="flex-1">
                  {/* Title Compact: text-base */}
                  <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {p.name}
                  </h3>
                  {/* Description Compact: text-xs */}
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {p.description || "No description provided."}
                  </p>
                </div>

                {/* Footer Compact: mt-3, pt-3 */}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                    <Calendar size={10} />
                    <span>{new Date(p.created_at).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && projects.length > 0 && (
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
      </div>

      {/* Modal Form */}
      <ProjectForm
        showForm={showForm}
        editMode={editMode}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onClose={() => {
          setShowForm(false);
          setEditMode(false);
          setEditId(null);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProjectPage;