import { useEffect, useState } from "react";
import lineAPI from "../axios/lineAPI";
import serviceApi from "../axios/serviceApi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, Plus, X, Layers, CornerDownRight } from "lucide-react"; 

const LinePage = () => {
  // --- GIỮ NGUYÊN LOGIC GỐC ---
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
    // UX IMPROVEMENT: Nếu đang tạo mới (không phải edit),
    // tự động set service_id của form theo filter đang chọn.
    if (!editingId && selectedServiceId) {
      setFormData((prev) => ({ ...prev, service_id: selectedServiceId }));
    }
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

      // Reset form logic
      setFormData({ name: "", service_id: selectedServiceId || "" }); // Giữ lại service id nếu đang filter
      setEditingId(null);
      if (selectedServiceId === formData.service_id) fetchLines();
    } catch {
      toast.error("Error saving line");
    }
  };

  const handleEdit = (line) => {
    setFormData({ name: line.name, service_id: line.service_id });
    setEditingId(line.id);
    // UX: Scroll to form on mobile, focus input logic could be added here
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this line?")) return; // UX: Safety check
    try {
      await lineAPI.deleteLine(id);
      toast.success("Line deleted!");
      fetchLines();
      // Nếu đang edit đúng dòng bị xóa thì reset form
      if (editingId === id) handleCancelEdit();
    } catch {
      toast.error("Cannot delete line");
    }
  };

  // New Helper for UX: Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", service_id: selectedServiceId || "" });
  };

  // --- PHẦN UI ĐƯỢC THIẾT KẾ LẠI ---
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
      
      {/* LEFT COLUMN: LIST & FILTER (Chiếm phần lớn diện tích) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header & Filter Area */}
        <div className="p-6 bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Layers className="text-indigo-600" /> Line Management
              </h1>
              <p className="text-slate-500 text-sm mt-1">Manage production lines by service</p>
            </div>
            
            <div className="w-full sm:w-72">
              <select
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(parseInt(e.target.value))}
              >
                <option value="">-- Select Service Filter --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main List Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedServiceId ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <CornerDownRight size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Select a service above to view lines</p>
            </div>
          ) : lines.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-100 rounded-xl border border-dashed border-slate-300">
              No lines found for this service. Create one!
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {lines.map((line) => (
                  <motion.div
                    layout
                    key={line.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    className={`bg-white p-5 rounded-xl border transition-all relative group ${
                      editingId === line.id ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50" : "border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-8">
                        <h3 className={`font-bold text-lg truncate ${editingId === line.id ? "text-indigo-700" : "text-slate-800"}`}>
                          {line.name}
                        </h3>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full border border-slate-200">
                           {services.find((s) => s.id === line.service_id)?.name || "Unknown Service"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons (Visible on Hover or Always on Touch) */}
                    <div className="mt-4 flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(line)}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(line.id)}
                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: FORM (Cố định, Sticky) */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 shadow-xl z-20 flex flex-col">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {editingId ? (
              <> <Edit2 size={20} className="text-yellow-500" /> Edit Line </>
            ) : (
              <> <Plus size={20} className="text-indigo-600" /> Create New Line </>
            )}
          </h2>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Line Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g., Production Line A1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus={!!editingId} 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Assign to Service</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: parseInt(e.target.value) })}
                required
              >
                <option value="">-- Select Service --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Link this line to a specific service operation.
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
              )}
              <button
                type="submit"
                className={`flex-1 py-2.5 px-4 text-white rounded-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2
                  ${editingId 
                    ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200" 
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                  }`}
              >
                {editingId ? "Update" : "Create Line"}
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer note */}
        <div className="p-4 bg-slate-50 text-xs text-center text-slate-400 border-t border-slate-100">
          {editingId ? `Editing ID: ${editingId}` : "Fill details to add a new line."}
        </div>
      </div>
    </div>
  );
};

export default LinePage;