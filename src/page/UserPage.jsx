import React, { useState } from "react";

const UserPage = () => {
  // 👉 Bỏ user mẫu, để trống ban đầu
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "" });

  // Lọc danh sách user
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // Xử lý thêm user
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role) return;
    setUsers([...users, { id: Date.now(), ...newUser }]);
    setNewUser({ name: "", email: "", role: "" });
    setShowForm(false);
  };

  return (
    <div className="p-8 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold text-indigo-600">Users</h1>
        
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
          + Add User
        </button>
      </div>

      {/* Search */}
      {/* để sau  */}
      <input
        type="text"
        placeholder="Search user by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
      />

      {/* Form Add User */}
      {showForm && (
        <form
          onSubmit={handleAddUser}
          className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Save User
          </button>
        </form>
      )}

      {/* Danh sách User */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="text-xs text-indigo-600 font-medium">{user.role}</span>
            </div>
            <button
              onClick={() => setUsers(users.filter((u) => u.id !== user.id))}
              className="text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <p className="text-gray-500 text-center italic">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserPage;
