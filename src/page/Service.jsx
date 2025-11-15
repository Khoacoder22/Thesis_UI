import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SearchBar from "../components/SearchbarComponent";
import Pagination from "../components/pagination";
import serviceAPI from "../axios/serviceApi"; 

const ServicePage = () => {
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

  const [newService, setNewService] = useState({
    name: "",
    description: "",
  });

  // ✅ Fetch Services with Pagination
  const fetchServices = async (page = 1, keyword = "") => {
    try {
      setLoading(true);
      const res = await serviceAPI.getService(page, keyword);
      console.log("SERVICE RESPONSE:", res.data);

      const list = res.data?.data || [];
      const p = res.data?.data?.pagination || {};

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

  // ✅ Auto fetch when page/search changes
  useEffect(() => {
    fetchServices(pagination.page, search);
  }, [pagination.page, search]);

  // ✅ Reset to page 1 when search changes
  const handleSearchChange = (val) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /** ✅ Add Service */
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

  /** ✅ Delete Service */
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

  /** ✅ Update Service */
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

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-600">Service Management</h1>
        <div className="flex-1 flex justify-center">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditService(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700"
        >
          Add Service
        </button>
      </div>

      {/* ✅ Create Service */}
      {showCreateForm && !editService && (
        <form
          onSubmit={handleAddService}
          className="bg-white p-6 rounded-xl shadow-md border mb-6 space-y-4"
        >
          <h2 className="font-bold text-lg">Add Service</h2>

          <input
            className="border p-2 rounded w-full"
            placeholder="Service name"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          />
          <textarea
            className="border p-2 rounded w-full"
            placeholder="Description"
            value={newService.description}
            onChange={(e) =>
              setNewService({ ...newService, description: e.target.value })
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
                setNewService({ name: "", description: "" });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ✅ Edit Service */}
      {editService && (
        <form
          onSubmit={handleUpdateService}
          className="bg-white p-6 rounded-xl shadow-md border mb-6 space-y-4"
        >
          <h2 className="font-bold text-lg">Edit Service</h2>

          <input
            className="border p-2 rounded w-full"
            value={editService.name}
            onChange={(e) =>
              setEditService({ ...editService, name: e.target.value })
            }
          />
          <textarea
            className="border p-2 rounded w-full"
            value={editService.description}
            onChange={(e) =>
              setEditService({ ...editService, description: e.target.value })
            }
          />

          <div className="flex gap-3 mt-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">
              Save 
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => setEditService(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleDelete}
            >
              Delete 
            </button>
          </div>
        </form>
      )}

     {/* ✅ Service List - modern card */}
        {!loading && !editService && !showCreateForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
            <div
                key={s.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 cursor-pointer transition-shadow duration-300 flex flex-col justify-between"
                onClick={() => {
                setEditService(s);
                setShowCreateForm(false);
                }}
            >
                <div>
                <h3 className="font-bold text-xl text-indigo-600 mb-2">{s.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{s.description}</p>
                </div>
                <div className="flex justify-between items-center text-gray-400 text-xs mt-4">
                <span>Created: {new Date(s.created_at).toLocaleDateString()}</span>
                </div>
            </div>
            ))}
        </div>
        )}


      {/* ✅ Pagination */}
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

export default ServicePage;
