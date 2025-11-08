import React, { useEffect, useState } from "react";
import staffAPI from "../axios/staff";
import { toast } from "react-toastify";

const Staff = () => {
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const fetchStaff = async () => {
    try {
      const res = await staffAPI.getAll(search);
      setStaffs(res.data?.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load staff list");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await staffAPI.create(newStaff);
      toast.success("Staff created successfully!");
      setShowCreateForm(false);
      setNewStaff({ name: "", email: "", password: "", phone: "" });
      fetchStaff();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-600">Staff</h1>

        <input
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />

        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700"
        >
          + Add Staff
        </button>
      </div>

      {/* CREATE STAFF FORM */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateStaff}
          className="bg-white p-6 rounded-xl shadow-md border mb-6 space-y-4"
        >
          <h2 className="font-bold text-lg">Create Staff</h2>

          <input
            className="border p-2 rounded w-full"
            placeholder="Name"
            value={newStaff.name}
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            required
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Email"
            value={newStaff.email}
            onChange={(e) =>
              setNewStaff({ ...newStaff, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            className="border p-2 rounded w-full"
            placeholder="Password"
            value={newStaff.password}
            onChange={(e) =>
              setNewStaff({ ...newStaff, password: e.target.value })
            }
            required
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Phone"
            value={newStaff.phone}
            onChange={(e) =>
              setNewStaff({ ...newStaff, phone: e.target.value })
            }
            required
          />

          <div className="flex gap-3 mt-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">
              Create
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* STAFF LIST */}
      <div className="grid gap-4">
        {staffs.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-xl shadow-sm p-4 border"
          >
            <h3 className="font-semibold">{staff.name}</h3>
            <p className="text-sm text-gray-500">{staff.email}</p>
            <p className="text-xs text-gray-600 mt-1">{staff.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Staff;
