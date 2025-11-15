import React, { useEffect, useState } from "react";
import lineAPI from "../axios/lineAPI";
import serviceApi from "../axios/serviceApi";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const LinePage = () => {
  const [lines, setLines] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: "", service_id: "" });
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await serviceApi.getService(1, "");
      setServices(res.data.data);
    } catch (err) {
      toast.error("Cannot load services!");
    }
  };

  const fetchLines = async () => {
    try {
      if (!selectedServiceId) return setLines([]);
      const res = await lineAPI.getLine(selectedServiceId);
      setLines(res.data.data.lines || []);
    } catch {
      toast.error("Cannot load lines!");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchLines();
  }, [selectedServiceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.service_id) return toast.error("Please select a service!");

      if (editingId) {
        await lineAPI.updateLine(editingId, formData);
        toast.success("Line updated!");
      } else {
        await lineAPI.postLine(formData);
        toast.success("Line created!");
      }

      setFormData({ name: "", service_id: "" });
      setEditingId(null);
      if (selectedServiceId === formData.service_id) fetchLines();
    } catch {
      toast.error("Error saving line");
    }
  };

  const handleEdit = (line) => {
    setFormData({ name: line.name, service_id: line.service_id });
    setEditingId(line.id);
  };

  const handleDelete = async (id) => {
    try {
      await lineAPI.deleteLine(id);
      toast.success("Line deleted!");
      fetchLines();
    } catch {
      toast.error("Cannot delete line");
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100 min-h-screen">
      <motion.div
        className="bg-white p-5 shadow-lg rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4">Line List</h2>

        <select
          className="w-full mb-4 px-3 py-2 border rounded-lg bg-gray-50"
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(parseInt(e.target.value))}
        >
          <option value="">-- Select a service to view lines --</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {!selectedServiceId && (
          <p className="text-gray-500 text-sm italic">Please select a service.</p>
        )}

        <ul className="space-y-3">
          {lines.map((line) => (
            <motion.li
              key={line.id}
              className="p-4 bg-gray-50 rounded-xl flex justify-between items-center shadow hover:shadow-md transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <p className="font-medium text-lg">{line.name}</p>
                <p className="text-sm text-gray-500">
                  Service: {services.find((s) => s.id === line.service_id)?.name || "N/A"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-yellow-400 rounded-lg hover:bg-yellow-300"
                  onClick={() => handleEdit(line)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-400"
                  onClick={() => handleDelete(line.id)}
                >
                  Delete
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="bg-white p-5 shadow-lg rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Line" : "Create Line"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Line Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-50"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Select Service</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-50"
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: parseInt(e.target.value) })}
              required
            >
              <option value="">-- Select a service --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 shadow"
          >
            {editingId ? "Update Line" : "Create Line"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LinePage;