import { useEffect, useState } from "react";
import SearchBar from "../components/SearchbarComponent";
import staffAPI from "../axios/staff";
import projectApi from "../axios/projectAPI";
import { toast } from "react-toastify";
import Pagination from "../components/pagination";

const StaffPage = () => {
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

  //  Fetch Staffs with Pagination
  const fetchStaffs = async (page = 1, keyword = "") => {
    try {
      setLoading(true);
      const res = await staffAPI.getAll(page, keyword, 5);
      console.log("STAFF RESPONSE:", res.data);

      const staffList = res.data?.data?.staff || [];
      const p = res.data?.data?.pagination || {};

      //  Attach project name nếu có
      const staffWithProjects = await Promise.all(
        staffList.map(async (s) => {
          if (s.project_id && !s.project) {
            try {
              const p = await projectApi.getById(s.project_id);
              return { ...s, project: p.data?.data?.name || null };
            } catch {
              return s;
            }
          }
          return s;
        })
      );

      setStaffs(staffWithProjects);

      //  Set pagination
      setPagination({
        page: p.page || 1,
        totalPages: p.totalPages || 1,
        hasNext: p.hasNext ?? false,
        hasPrev: p.hasPrev ?? false,
      });
    } catch (error) {
      console.error("Failed to fetch staffs:", error);
    } finally {
      setLoading(false);
    }
  };

  //  Runs when page or search changes
  useEffect(() => {
    fetchStaffs(pagination.page, search);
  }, [pagination.page, search]);

  //  Reset to page 1 when search changed
  const handleSearchChange = (val) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /**  Add staff */
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

  /**  Delete staff */
  const handleDelete = async () => {
    try {
      await staffAPI.delete(editStaff.id);
      await fetchStaffs();
      setEditStaff(null);
      toast.success("Deleted successfully!");
    } catch {
      toast.error("Delete failed!");
    }
  };

  /**  Update staff */
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

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-600">Staff Management</h1>
        <div className="flex-1 flex justify-center">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditStaff(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700"
        >
          + Add Staff
        </button>
      </div>

      {/*  Create Staff */}
      {showCreateForm && !editStaff && (
        <form
          onSubmit={handleAddStaff}
          className="bg-white p-6 rounded-xl shadow-md border mb-6 space-y-4"
        >
          <h2 className="font-bold text-lg">Add Staff</h2>

          <input
            className="border p-2 rounded w-full"
            placeholder="Name"
            value={newStaff.name}
            onChange={(e) =>
              setNewStaff({ ...newStaff, name: e.target.value })
            }
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Email"
            value={newStaff.email}
            onChange={(e) =>
              setNewStaff({ ...newStaff, email: e.target.value })
            }
          />
          <input
            type="password"
            className="border p-2 rounded w-full"
            placeholder="Password"
            value={newStaff.password}
            onChange={(e) =>
              setNewStaff({ ...newStaff, password: e.target.value })
            }
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Phone"
            value={newStaff.phone}
            onChange={(e) =>
              setNewStaff({ ...newStaff, phone: e.target.value })
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
                setNewStaff({
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

      {/*  Edit Staff */}
      {editStaff && (
        <form
          onSubmit={handleUpdateStaff}
          className="bg-white p-6 rounded-xl shadow-md border mb-6 space-y-4"
        >
          <h2 className="font-bold text-lg">Edit Staff</h2>

          <input
            className="border p-2 rounded w-full"
            value={editStaff.name}
            onChange={(e) =>
              setEditStaff({ ...editStaff, name: e.target.value })
            }
          />
          <input
            className="border p-2 rounded w-full"
            value={editStaff.email}
            onChange={(e) =>
              setEditStaff({ ...editStaff, email: e.target.value })
            }
          />
          <input
            type="password"
            className="border p-2 rounded w-full"
            placeholder="New password (optional)"
            onChange={(e) =>
              setEditStaff({ ...editStaff, password: e.target.value })
            }
          />
          <input
            className="border p-2 rounded w-full"
            value={editStaff.phone}
            onChange={(e) =>
              setEditStaff({ ...editStaff, phone: e.target.value })
            }
          />
          <div className="flex gap-3 mt-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">
              Save Changes
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => setEditStaff(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleDelete}
            >
              Delete Staff
            </button>
          </div>
        </form>
      )}

      {/*  Staff List */}
      {!loading && !editStaff && !showCreateForm && (
        <div className="grid gap-4">
          {staffs.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-xl shadow-sm p-4 border cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setEditStaff(staff);
                setShowCreateForm(false);
              }}
            >
              <h3 className="font-semibold">{staff.name}</h3>
              <p className="text-sm text-gray-500">{staff.email}</p>
              {staff.project && (
                <p className="text-sm text-gray-400">
                  Project: {staff.project}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/*  Pagination */}
      <div className="mt-8">
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

export default StaffPage;
