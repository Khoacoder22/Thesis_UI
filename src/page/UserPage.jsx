import React, { useEffect, useState, useRef } from "react";
import SearchBar from "../components/SearchbarComponent";
import userApi from "../axios/userAPI";
import projectApi from "../axios/projectAPI";
import { toast } from "react-toastify";
import Pagination from "../components/pagination";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
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

  // ✅ Fetch Users with Correct Pagination
  const fetchUsers = async (page = 1, keyword = "") => {
    try {
      setLoading(true);
      const res = await userApi.getAll(page, keyword, 5);

      console.log("PAGINATION RESPONSE:", res.data.pagination);

      let users = res.data?.data || [];

      // ✅ Attach project name if needed
      users = await Promise.all(
        users.map(async (u) => {
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

      setUsers(users);

      // ✅ Fix pagination mapping
      if (res.data?.pagination) {
        const p = res.data.pagination;

        setPagination({
          page: p.page || p.current_page || 1,
          totalPages: p.totalPages || p.total_pages || p.total || 1,
          hasNext:
            p.hasNext ??
            p.has_next ??
            ((p.page || p.current_page) < (p.totalPages || p.total_pages)),
          hasPrev:
            p.hasPrev ??
            p.has_prev ??
            ((p.page || p.current_page) > 1),
        });
      } else {
        setPagination({
          page: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Runs when page or search changes
  useEffect(() => {
    fetchUsers(pagination.page, search);
  }, [pagination.page, search]);

  // ✅ Reset to page 1 when search changed
  const handleSearchChange = (val) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /** ✅ Project Selector Load */
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

  /** ✅ Add user */
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

  /** ✅ Delete user */
  const handleDelete = async () => {
    if (!window.confirm("Delete this admin?")) return;
    try {
      await userApi.deleteUser(editUser.id);
      await fetchUsers();
      setEditUser(null);
      toast.success("Deleted!");
    } catch {
      toast.error("Delete failed!");
    }
  };

  /** ✅ Update user */
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
      toast.error("Update failed!");
    }
  };

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-600">Admins</h1>
        <div className="flex-1 flex justify-center">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditUser(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700"
        >
          + Add Admin
        </button>
      </div>

      {/* ✅ Create User */}
      {showCreateForm && !editUser && (
        <form
          onSubmit={handleAddUser}
          className="bg-white p-6 rounded-xl shadow-md border mb-6 space-y-4"
        >
          <h2 className="font-bold text-lg">Add Admin</h2>

          <input
            className="border p-2 rounded w-full"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) =>
              setNewUser({ ...newUser, name: e.target.value })
            }
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
          />

          <input
            type="password"
            className="border p-2 rounded w-full"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Phone"
            value={newUser.phone}
            onChange={(e) =>
              setNewUser({ ...newUser, phone: e.target.value })
            }
          />

          <div className="flex gap-3 mt-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">
              Create
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => {
                setShowCreateForm(false);
                setNewUser({
                  name: "",
                  email: "",
                  password: "",
                  phone: "",
                });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ✅ Edit User */}
      {editUser && (
        <form
          onSubmit={handleUpdateUser}
          className="bg-white p-6 rounded-xl shadow-md border mb-6 space-y-4"
        >
          <h2 className="font-bold text-lg">Edit Admin</h2>

          <input
            className="border p-2 rounded w-full"
            value={editUser.name}
            onChange={(e) =>
              setEditUser({ ...editUser, name: e.target.value })
            }
          />
          <input
            className="border p-2 rounded w-full"
            value={editUser.email}
            onChange={(e) =>
              setEditUser({ ...editUser, email: e.target.value })
            }
          />
          <input
            type="password"
            className="border p-2 rounded w-full"
            placeholder="New password (optional)"
            onChange={(e) =>
              setEditUser({ ...editUser, password: e.target.value })
            }
          />
          <input
            className="border p-2 rounded w-full"
            value={editUser.phone}
            onChange={(e) =>
              setEditUser({ ...editUser, phone: e.target.value })
            }
          />

          {/* ✅ Project Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <input
              className="w-full p-2 border rounded"
              placeholder="Search project..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              onFocus={() => setDropdownOpen(true)}
            />

            {dropdownOpen && (
              <ul className="absolute z-50 bg-white border rounded w-full max-h-48 overflow-y-auto shadow">
                {allProjects.map((p) => (
                  <li
                    key={p.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedProject(p);
                      setProjectSearch(p.name);
                      setDropdownOpen(false);
                    }}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">
              Save Changes
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => setEditUser(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleDelete}
            >
              Delete Admin
            </button>
          </div>
        </form>
      )}

      {/* ✅ User List */}
      {!loading && !editUser && !showCreateForm && (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-sm p-4 border cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setEditUser(user);
                setShowCreateForm(false);
              }}
            >
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.project && (
                <p className="text-xs text-gray-600 mt-1">
                  Project: <b>{user.project.name ?? user.project}</b>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✅ Pagination */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasPrev={pagination.hasPrev}
          hasNext={pagination.hasNext}
          onPrev={() =>
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
          }
          onNext={() =>
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
          }
        />
      </div>
    </div>
  );
};

export default UserPage;
