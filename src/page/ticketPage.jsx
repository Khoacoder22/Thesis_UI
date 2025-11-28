import React, { useEffect, useState, useCallback } from "react";
import { 
  CheckCircle, 
  XCircle, 
  PhoneCall, 
  User,
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Ticket as TicketIcon, 
  RefreshCw,
  Clock,
  Filter
} from "lucide-react";
import ticketAPI from "../axios/ticketAPI";
import serviceApi from "../axios/serviceApi";
import lineAPI from "../axios/lineAPI";
import { toast } from "react-toastify";

const TicketPage = () => {
  // --- DATA STATE ---
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  
  const [lines, setLines] = useState([]);
  const [lineId, setLineId] = useState("");
  
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  // --- FILTER & PAGINATION STATE ---
  const [filterStatus, setFilterStatus] = useState("waiting"); // default to 'waiting'
  const [searchTerm, setSearchTerm] = useState(""); // Input value
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ 
    total: 0, totalPages: 1, hasNext: false, hasPrev: false 
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // 1. Load Services
  // useEffect(() => {
  //   const loadServices = async () => {
  //     try {
  //       const res = await serviceApi.getService();
  //       setServices(res.data.data || []);
  //     } catch (err) {
  //       toast.error("Cannot load services");
  //     }
  //   };
  //   loadServices();
  // }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        // SỬA DÒNG NÀY: Truyền tham số thứ 3 là limit lớn (ví dụ 100)
        const res = await serviceApi.getService(1, "", 100);
        
        // Kiểm tra kỹ cấu trúc data trả về (thường nằm trong data hoặc data.services)
        const list = res.data.data?.services || res.data.data || [];
        setServices(list);
      } catch (err) {
        toast.error("Cannot load services");
      }
    };
    loadServices();
  }, []);

  // 2. Load Lines
  useEffect(() => {
    if (!serviceId) return;
    const loadLines = async () => {
      try {
        const res = await lineAPI.getLine(serviceId);
        setLines(res.data.data?.lines || []);
        setLineId(""); 
      } catch (err) {
        toast.error("Cannot load lines");
      }
    };
    loadLines();
  }, [serviceId]);

  // 3. Fetch Tickets (Realtime search)
  const fetchTickets = useCallback(async () => {
    if (!lineId) return;

    setIsLoading(true);
    try {
      const params = {
        page: page,
        limit: 10,
        status: filterStatus === "all" ? "" : filterStatus,
        search: searchTerm
      };

      const res = await ticketAPI.getAll(lineId, params);
      
      setTickets(res.data.data?.tickets || []);
      setPagination(res.data.data?.pagination || { total: 0, totalPages: 1 });
      
    } catch (err) {
      console.error("Error fetching tickets:", err);
      toast.error("Cannot load tickets list");
    } finally {
      setIsLoading(false);
    }
  }, [lineId, filterStatus, searchTerm, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset page về 1 khi đổi bộ lọc hoặc line hoặc search
  useEffect(() => {
    setPage(1);
    setSelectedTicketId(null);
  }, [lineId, filterStatus, searchTerm]);

  // --- ACTIONS ---

  const handleCallNext = async () => {
    if (!lineId) return toast.warn("Please select a line first!");
    
    try {
      const res = await ticketAPI.putTicket(lineId);
      toast.success(res.data.message || "Called next ticket!");
      setFilterStatus("serving");
      setSearchTerm("");
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to call next ticket");
    }
  };

  const handleFinish = async () => {
    if (!selectedTicketId) return toast.warn("Please select a ticket!");
    try {
      const res = await ticketAPI.putFinish(selectedTicketId);
      toast.success(res.data.message || "Ticket finished!");
      fetchTickets();
      setSelectedTicketId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to finish ticket");
    }
  };

  const handleCancel = async () => {
    if (!selectedTicketId) return toast.warn("Please select a ticket!");
    if (!window.confirm("Are you sure you want to cancel this ticket?")) return;

    try {
      const res = await ticketAPI.putCancel(selectedTicketId);
      toast.success(res.data.message || "Ticket canceled!");
      fetchTickets();
      setSelectedTicketId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel ticket");
    }
  };

  // --- UI HELPERS ---
  const getStatusColor = (status) => {
    switch (status) {
      case "waiting": return "bg-amber-50 text-amber-700 border-amber-200";
      case "serving": return "bg-blue-50 text-blue-700 border-blue-200";
      case "done": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const selectedTicketData = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* HEADER: SELECT SERVICE & LINE */}
      <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
              <TicketIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Counter Dashboard</h1>
              <p className="text-xs text-slate-500">Select a line to start managing queue</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select 
              className="flex-1 md:w-48 px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={serviceId}
              onChange={(e) => { setServiceId(e.target.value); setLineId(""); setTickets([]); }}
            >
              <option value="">-- Select Service --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select 
              className="flex-1 md:w-48 px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              disabled={!serviceId}
            >
              <option value="">-- Select Line --</option>
              {lines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: LIST & FILTERS (7/12) */}
        <section className="lg:col-span-7 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
          
          {/* Toolbar: Search & Filter */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-white z-10">
            {/* Status Tabs - The Filter UI */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Filter size={16} className="text-slate-400 shrink-0" />
              {['waiting', 'serving', 'done', 'cancelled', 'all'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap border transition-all
                    ${filterStatus === status 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 relative bg-slate-50/50">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                <RefreshCw className="animate-spin text-indigo-600" size={32} />
              </div>
            )}

            {!lineId ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Layers size={48} className="mb-3 opacity-20" />
                  <p>Please select a Line to view tickets</p>
               </div>
            ) : tickets.length === 0 ? (
               <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  No tickets found for "{filterStatus}".
               </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`group p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md bg-white
                    ${selectedTicketId === t.id 
                      ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30" 
                      : "border-slate-200 hover:border-indigo-300"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                        ${selectedTicketId === t.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                        <User size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{t.user?.name || "Guest"}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                           <PhoneCall size={10} /> {t.user?.phone || "No Phone"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                           <Clock size={10} />
                           <span>ID: {t.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-mono font-black text-slate-700">
                        {/* {t.user?.ticket_number || t.number || "---"} */}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Footer */}
          {lineId && (
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500">
               <span>Total: {pagination.total}</span>
               <div className="flex gap-2 items-center">
                  <button 
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 border"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>Page {pagination.page} / {pagination.totalPages}</span>
                  <button 
                    disabled={!pagination.hasNext}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 border"
                  >
                    <ChevronRight size={16} />
                  </button>
               </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: ACTIONS (5/12) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex-1 flex flex-col relative overflow-hidden">
            <div className="bg-slate-800 text-white p-3 text-center text-xs uppercase tracking-widest font-bold">
              Action Center
            </div>

            {/* Selected Ticket Info */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              {selectedTicketData ? (
                <div className="w-full animate-fadeIn">
                   <div className="mb-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">Selected Ticket</div>
                   <h2 className="text-3xl font-bold text-slate-800 mb-1">{selectedTicketData.user?.name || "Unknown"}</h2>
                   <p className="text-slate-500 mb-6 font-mono text-lg">{selectedTicketData.user?.phone}</p>

                   <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase border mb-8 ${getStatusColor(selectedTicketData.status)}`}>
                      {selectedTicketData.status}
                   </div>
                   
                   {/* Context Info */}
                   <div className="grid grid-cols-2 gap-2 w-full text-left text-xs bg-slate-50 p-3 rounded-lg">
                      <div>
                        <span className="text-slate-400 block">Waiting time</span>
                        <span className="font-semibold">{selectedTicketData.waiting_time || 0} mins</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Queue Size</span>
                        <span className="font-semibold">{selectedTicketData.queue_length_at_join || 0} people</span>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-slate-400 flex flex-col items-center opacity-60">
                  <TicketIcon size={48} className="mb-2" />
                  <p>Select a ticket to perform actions</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-5 bg-white border-t border-slate-100 space-y-3">
              <button
                onClick={handleCallNext}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <PhoneCall size={20} className="animate-pulse" />
                CALL NEXT TICKET
              </button>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleFinish}
                  disabled={!selectedTicketId || selectedTicketData?.status === 'done'}
                  className="py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Finish
                </button>
                
                <button
                  onClick={handleCancel}
                  disabled={!selectedTicketId || selectedTicketData?.status === 'cancelled'}
                  className="py-3 bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Cancel
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TicketPage;