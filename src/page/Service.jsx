import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit3, Trash2, X, Layers, Calendar, Save, ArrowLeft,} from "lucide-react";
import SearchBar from "../components/SearchbarComponent";
import Pagination from "../components/pagination";
import serviceAPI from "../axios/serviceApi"; 

const ServicePage = () => {
  // --- GIỮ NGUYÊN LOGIC CŨ ---
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [newService, setNewService] = useState({ name: "", description: "" });

  const fetchServices = async (page = 1, keyword = "") => {
    try {
      setLoading(true);
      const res = await serviceAPI.getService(page, keyword);
      const list = res.data?.data || [];
      const p = res.data?.pagination || {};

      setServices(list);
      setPagination({
        page: p.page || 1,
        totalPages: p.totalPages || 1,
        hasNext: p.hasNext ?? false,
        hasPrev: p.hasPrev ?? false,
      });
    } catch (err) {
      console.error("Failed to fetch services:", err);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(pagination.page, search);
  }, [pagination.page, search]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await serviceAPI.createService(newService);
      await fetchServices();
      setShowCreateForm(false);
      setNewService({ name: "", description: "" });
      toast.success("Service created successfully!");
    } catch (error) {
      const msg = error.response?.data?.message || "Create failed!";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await serviceAPI.deleteService(editService.id);
      await fetchServices();
      setEditService(null);
      toast.success("Deleted successfully!");
    } catch {
      toast.error("Delete failed!");
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      await serviceAPI.update(editService.id, editService);
      await fetchServices();
      setEditService(null);
      toast.success("Updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Update failed!");
    }
  };

  // --- PHẦN UI ĐƯỢC TỐI ƯU HÓA ---

  // Component Skeleton Loading
  const ServiceSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
          <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
          <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto p-4 md:p-6 font-sans text-gray-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="text-indigo-600" /> Service Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your service offerings efficiently.</p>
        </div>

        {/* Chỉ hiện nút Add và Search khi KHÔNG ở chế độ Form */}
        {!showCreateForm && !editService && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="w-full sm:w-64">
                <SearchBar value={search} onChange={handleSearchChange} placeholder="Search services..." />
             </div>
            <button
              onClick={() => { setShowCreateForm(true); setEditService(null); }}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <Plus size={20} /> Add Service
            </button>
          </div>
        )}
      </div>

      {/* --- FORM SECTION (CREATE / EDIT) --- */}
      {(showCreateForm || editService) && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
            {/* Form Header */}
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {editService ? <Edit3 className="text-indigo-500" /> : <Plus className="text-indigo-500" />}
                {editService ? "Edit Service Details" : "Create New Service"}
              </h2>
              <button 
                onClick={() => { setShowCreateForm(false); setEditService(null); }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={editService ? handleUpdateService : handleAddService} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="e.g. Premium Consultation"
                  value={editService ? editService.name : newService.name}
                  onChange={(e) => editService 
                    ? setEditService({ ...editService, name: e.target.value }) 
                    : setNewService({ ...newService, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-h-[120px] resize-none"
                  placeholder="Describe the service details..."
                  value={editService ? editService.description : newService.description}
                  onChange={(e) => editService 
                    ? setEditService({ ...editService, description: e.target.value }) 
                    : setNewService({ ...newService, description: e.target.value })}
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                  <Save size={18} /> {editService ? "Save Changes" : "Create Service"}
                </button>
                
                {editService && (
                  <button 
                    type="button" 
                    onClick={handleDelete}
                    className="px-5 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-medium flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setEditService(null); }}
                  className="px-5 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIST SECTION --- */}
      {!showCreateForm && !editService && (
        <>
          {loading ? (
            <ServiceSkeleton />
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
               <div className="bg-indigo-50 p-4 rounded-full mb-4">
                 <Layers size={40} className="text-indigo-400" />
               </div>
               <h3 className="text-xl font-bold text-gray-800">No services found</h3>
               <p className="text-gray-500 mt-2 mb-6 max-w-xs">Try adjusting your search or create a new service to get started.</p>
               <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create First Service
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="group relative bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                  onClick={() => { setEditService(s); setShowCreateForm(false); }}
                >
                  {/* Icon / Avatar for Service */}
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <Layers size={24} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                      {s.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      <Calendar size={12} />
                      {new Date(s.created_at).toLocaleDateString()}
                    </div>
                    <span className="text-indigo-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                      Edit <ArrowLeft size={12} className="rotate-180" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && services.length > 0 && (
            <div className="mt-10 flex justify-center">
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
        </>
      )}
    </div>
  );
};

export default ServicePage;