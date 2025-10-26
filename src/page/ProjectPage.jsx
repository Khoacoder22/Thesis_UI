import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api/projects";

const ProjectPage = () => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch projects when page OR search changes
  useEffect(() => {
    fetchProjects(pagination.page, search);
  }, [pagination.page, search]);

  // Function fetch project list
  const fetchProjects = async (page = 1, keyword = "") => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}?page=${page}&limit=16&search=${encodeURIComponent(keyword)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (res.status === 401 || res.status === 403) {
        alert("Invalid role or your token expired. Please login again!");
        return;
      }

      const data = await res.json();

      setProjects(data.data || []);
      setPagination({
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 1,
        hasNext: data.pagination?.hasNext || false,
        hasPrev: data.pagination?.hasPrev || false,
      });
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // Save new project
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Please enter project name!");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      if (res.status === 201) {
        fetchProjects(pagination.page, search);
        setFormData({ name: "", description: "" });
        setShowForm(false);
      } else if (res.status === 401 || res.status === 403) {
        alert("Invalid role or your token expired. Please login again!");
      } else {
        const errText = await res.text();
        alert("Error: " + res.status + " " + errText);
      }
    } catch (err) {
      console.error("Project:", err);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <h2 className="text-2xl font-bold text-indigo-600">Projects</h2>

          <input
            type="text"
            placeholder="Search project..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 })); // reset to page 1 when you search
            }}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
          />

          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + New Project
          </button>
        </div>

        {/* List projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.length > 0 ? (
            projects.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <h3 className="text-base font-semibold text-indigo-700 truncate">
                  {p.name}
                </h3>
                <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                  {p.description}
                </p>
                <p className="text-gray-400 text-xs mt-3 flex items-center gap-1">
                  <span>📅</span>{" "}
                  {new Date(p.created_at).toLocaleString("en-GB")}
                </p>
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

      {/* Create Project Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-indigo-600 mb-4">
              Create Project
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
