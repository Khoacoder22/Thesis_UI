import React, { useState, useEffect } from "react";

const ProjectPage = () => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner: "",
  });

  // 🔁 Lấy dữ liệu từ LocalStorage khi trang load
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    setProjects(savedProjects);
  }, []);

  // 💾 Lưu lại vào LocalStorage mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  // ✅ Xử lý lưu form
  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return alert("Vui lòng nhập tên project!");

    const newProject = {
      id: Date.now(),
      ...formData,
    };

    setProjects([...projects, newProject]);
    setFormData({ name: "", description: "", owner: "" });
    setShowForm(false);
  };

  // 🔍 Lọc theo từ khóa
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600">Projects</h2>

        {/* Thanh search */}
        <input
          type="text"
          placeholder="Search project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {/* Nút tạo project */}
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + New Project
        </button>
      </div>

      {/* Danh sách project */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow p-5 border border-gray-100 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-indigo-600">
                {p.name}
              </h3>
              <p className="text-gray-600 mt-2 text-sm">{p.description}</p>
              <p className="text-gray-400 text-sm mt-3">
                👤 {p.owner || "Unknown"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No projects found</p>
        )}
      </div>

      {/* Form tạo project (overlay) */}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) =>
                    setFormData({ ...formData, owner: e.target.value })
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
