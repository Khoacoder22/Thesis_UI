import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchBar from "../components/SearchbarComponent";
import ProjectForm from "../components/ProjectForm";
import projectApi from "../axios/projectAPI";

const ProjectPage = () => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Load dữ liệu khi page hoặc search thay đổi
  useEffect(() => {
    fetchProjects(pagination.page, search);
  }, [pagination.page, search]);

  const fetchProjects = async (page = 1, keyword = "") => {
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
    }
  };

  // SAVE or UPDATE
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

      // Làm mới danh sách nhưng KHÔNG đóng form
      fetchProjects(pagination.page, search);
    } catch (err) {
      console.error("Save error:", err);
      const message = err.response?.data?.message || "Failed to save project!";
      toast.error(message);
    }
  };

  // Khi click vào card
  const handleEditClick = (project) => {
    setEditMode(true);
    setEditId(project.id);
    setFormData({ name: project.name, description: project.description });
    setShowForm(true);
  };

  // DELETE
  const handleDelete = async () => {
  if (!editId) {
    toast.error("Project ID is missing!");
    return;
  }

  try {
    await projectApi.delete(editId);
    toast.success("Project deleted successfully!");

    fetchProjects(pagination.page, search);

    // Reset form state
    setShowForm(false);
    setEditMode(false);
    setEditId(null);
  } catch (err) {
    console.error("Delete error:", err);
    const message = err.response?.data?.message || "Failed to delete project!";
    toast.error(message);
  }
};

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <h2 className="text-2xl font-bold text-indigo-600">Projects</h2>

          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />

          <button
            onClick={() => {
              setEditMode(false);
              setFormData({ name: "", description: "" });
              setShowForm(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + New Project
          </button>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.length > 0 ? (
            projects.map((p) => (
              <div
                key={p.id}
                onClick={() => handleEditClick(p)}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 
                           hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <h3 className="text-base font-semibold text-indigo-700 truncate">
                  {p.name}
                </h3>
                <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                  {p.description}
                </p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{new Date(p.created_at).toLocaleString("en-GB")}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No projects found</p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8 gap-4">
          <button
            disabled={!pagination.hasPrev}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            className={`px-4 py-2 rounded-lg ${
              !pagination.hasPrev
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Prev
          </button>

          <span className="text-gray-700 font-medium">
            Page {pagination.page} / {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.hasNext}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            className={`px-4 py-2 rounded-lg ${
              !pagination.hasNext
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Form */}
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
