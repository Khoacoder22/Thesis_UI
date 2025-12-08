import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { 
  CheckCircle, 
  XCircle, 
  PhoneCall, 
  RefreshCw,
  MonitorUp, 
  ArrowLeft,
} from "lucide-react";
import ticketAPI from "../axios/ticketAPI";
import { toast } from "react-toastify";

// --- HELPER: Format Timer ---
const formatDuration = (seconds) => {
  if (!seconds) return "00:00:00";
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// --- SUB-COMPONENT: PiP Window (Cửa sổ thu nhỏ) ---
const PipQueueWindow = ({ ticket, stats, onNext, onFinish, onCancel }) => {
  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-4 font-sans box-border select-none">
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
        <div className="text-xs font-mono text-slate-400">Waiting: <span className="text-amber-400 font-bold text-lg">{stats.waiting}</span></div>
        <div className="text-xs text-slate-400">Total: {stats.total}</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {ticket ? (
          <div className="animate-fadeIn w-full">
             <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Serving</div>
             <h1 className="text-6xl font-black text-white mb-2 tracking-tighter truncate">{ticket.queueNumber}</h1>
             <p className="text-xl text-indigo-300 font-bold truncate px-2">{ticket.name}</p>
          </div>
        ) : (
          <div className="text-slate-600 flex flex-col items-center opacity-50">
            <span className="text-2xl font-bold">READY</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button onClick={onNext} className="col-span-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95">
          <PhoneCall size={20} className="animate-pulse"/> NEXT
        </button>
        <button onClick={onFinish} disabled={!ticket} className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 rounded-lg font-bold">Finish</button>
        <button onClick={onCancel} disabled={!ticket} className="py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 rounded-lg font-bold">Cancel</button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const CounterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const lineId = searchParams.get("lineId");
  
  // State manifacture Line Info
  const [lineInfo, setLineInfo] = useState(() => {
    if (!lineId) return null;
    if (location.state?.lineInfo) {
      return location.state.lineInfo;
    }
    const cached = sessionStorage.getItem(`line_${lineId}`);
    return cached ? JSON.parse(cached) : { id: lineId, name: `Line #${lineId}`, stats: { waiting: 0 } };
  });
  
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  
  // State Loading & Refresh
  const [isLoading, setIsLoading] = useState(false); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pipWindow, setPipWindow] = useState(null);

  // --- 1. FETCH & MAP DATA ---
  const fetchTickets = useCallback(async (isBackground = false) => {
    if (!lineId) return;

    //(auto update) thì KHÔNG hiện loading
    if (!isBackground) setIsLoading(true);

    try {
      const res = await ticketAPI.getAll(lineId, { page: 1, limit: 100 });
      
      // Xử lý dữ liệu thô (Raw Data)
      let rawData = [];
      const responseBody = res.data ? res.data : res;
      if (responseBody.data && Array.isArray(responseBody.data)) rawData = responseBody.data;
      else if (responseBody.data?.tickets && Array.isArray(responseBody.data.tickets)) rawData = responseBody.data.tickets;
      else if (Array.isArray(responseBody)) rawData = responseBody;
      else if (responseBody.tickets && Array.isArray(responseBody.tickets)) rawData = responseBody.tickets;

      // MAPPING DỮ LIỆU (Sửa lỗi N/A)
      const formattedTickets = rawData.map(t => ({
        ...t,
        queueNumber:`ID:${t.id}`,
        name:  t.user?.name,
        phone: t.user?.phone ,
        status: (t.status || "waiting").toLowerCase(),
        joined_at: t.joined_at || t.created_at || new Date().toISOString()
      }));

      setTickets(formattedTickets);

      // Tìm vé đang gọi
      const activeTicket = formattedTickets.find(t => 
        ['serving', 'processing', 'calling', 'active'].includes(t.status)
      );
      setCurrentTicket(activeTicket || null);
      
      // Cập nhật tên Line nếu có
      if (formattedTickets.length > 0 && formattedTickets[0].line_name) {
          setLineInfo(prev => ({ ...prev, name: formattedTickets[0].line_name }));
      }

    } catch (err) {
      console.error("Fetch error:", err);
      // Chỉ báo lỗi nếu không phải chạy ngầm
      if (!isBackground && err.response && err.response.status !== 404) {
         toast.error("Lỗi cập nhật dữ liệu");
      }
    } finally {
      if (!isBackground) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [lineId]);

  // --- 2. SETUP AUTO UPDATE ---
  useEffect(() => {
    // Gọi lần đầu (hiện loading)
    fetchTickets(false);

    // auto update in every 3 seconds
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [lineId, fetchTickets]);

  // --- 3. TIMER LOGIC ---
  useEffect(() => {
    if (currentTicket) {
      clearInterval(timerRef.current);
      if (currentTicket.served_at) {
          const startTime = new Date(currentTicket.served_at).getTime();
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setTimer(elapsed > 0 ? elapsed : 0);
      } else {
          setTimer(0);
      }
      timerRef.current = setInterval(() => setTimer(p => p + 1), 1000);
    } else {
      setTimer(0);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [currentTicket?.id]);

  // --- 4. ACTIONS (CẬP NHẬT NGAY LẬP TỨC) ---
  const handleCallNext = async () => {
    if (!lineId) return;
    try {
      await ticketAPI.putTicket(lineId);
      toast.success("Calling Next...");
      fetchTickets(false); // Reload imediately
    } catch (err) { 
      toast.error(err.response?.data?.message || "Lỗi gọi số"); 
    }
  };

  const handleFinish = async () => {
    if (!currentTicket) return;
    try {
      await ticketAPI.putFinish(currentTicket.id);
      toast.success("Finished!");
      fetchTickets(false);
    } catch (err) { toast.error("Lỗi Finish"); }
  };

  const handleCancel = async () => {
    if (!currentTicket) return;
    if (!window.confirm("Hủy vé này?")) return;
    try {
      await ticketAPI.putCancel(currentTicket.id);
      toast.success("Cancelled!");
      fetchTickets(false);
    } catch (err) { toast.error("Lỗi Cancel"); }
  };

  const togglePiP = async () => {
    if (!("documentPictureInPicture" in window)) return toast.error("Trình duyệt không hỗ trợ PiP");
    if (pipWindow) { pipWindow.close(); setPipWindow(null); return; }
    try {
      const pip = await window.documentPictureInPicture.requestWindow({ width: 320, height: 450 });
      [...document.styleSheets].forEach((s) => {
        try { pip.document.head.appendChild(s.ownerNode.cloneNode(true)); } catch (e) {}
      });
      pip.addEventListener("pagehide", () => setPipWindow(null));
      setPipWindow(pip);
    } catch (err) { console.error(err); }
  };

  const handleBackToMonitor = () => navigate('/monitorPage');

  if (!lineId) return null;

  const waitingTickets = tickets.filter(t => ['waiting', 'pending'].includes(t.status));

  // --- GIAO DIỆN CŨ (UI CŨ) ---
  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      
      {/* PiP Portal */}
      {pipWindow && createPortal(
        <PipQueueWindow 
          ticket={currentTicket}
          stats={{ waiting: waitingTickets.length, total: tickets.length }}
          onNext={handleCallNext}
          onFinish={handleFinish}
          onCancel={handleCancel}
        />,
        pipWindow.document.body
      )}

      {/* HEADER */}
      <header className="bg-black text-white h-14 flex items-center justify-between px-4 shadow-md shrink-0 z-20">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleBackToMonitor}
            className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold text-sm uppercase tracking-wide">Monitor</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-wide hidden md:block">
            {lineInfo?.name || `QUẦY #${lineId}`}
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsRefreshing(true); fetchTickets(false); }} 
              disabled={isRefreshing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white px-3 py-1 rounded text-sm font-bold flex items-center gap-1 transition-all"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""}/> 
            </button>
            <button 
              onClick={togglePiP} 
              className={`px-3 py-1 rounded text-sm font-bold flex items-center gap-1 border border-gray-600 transition-colors ${pipWindow ? 'bg-indigo-900 text-indigo-300' : 'hover:bg-gray-800'}`}
            >
              <MonitorUp size={14}/> {pipWindow ? "ON" : "Mini"}
            </button>
          </div>
        </div>
        <div className="w-20"></div> 
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">
        
        {/* CURRENT SERVING */}
        <section className="col-span-12 lg:col-span-5 bg-white rounded shadow-sm border border-slate-200 flex flex-col relative">
           <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Current Serving</h2>
              <div className="text-2xl font-bold text-slate-600 mb-2">Queue Number</div>
              
              {/* HIỂN THỊ SỐ VÉ TO */}
              <div className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter mb-4">
                 {currentTicket ? (currentTicket.queueNumber) : "---"}
              </div>

              <div className="text-slate-500 font-medium text-lg mb-1">Serving Time</div>
              
              {/* TIMER TO */}
              <div className="text-5xl font-mono font-bold text-slate-800 mb-6 tracking-widest">
                 {formatDuration(timer)}
              </div>

              {/* Customer name*/}
              <div className="text-xl font-bold uppercase text-slate-800 mb-2 truncate max-w-full px-4">
                 {currentTicket ? (currentTicket.name) : "NO ACTIVE TICKET"}
              </div>
              <div className="text-lg text-slate-600 font-medium mb-1">
                 Counter: <span className="text-slate-900">{lineInfo?.name || `Line ${lineId}`}</span>
              </div>
              <div className="text-sm text-slate-400 font-mono">
                 Issue Date: {currentTicket?.joined_at ? new Date(currentTicket.joined_at).toLocaleString() : "N/A"}
              </div>
           </div>
        </section>

        {/* ACTIONS (Giao diện cũ - Nút dọc) */}
        <section className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-4">
           <button 
             onClick={handleCallNext}
             disabled={!lineId || isLoading}
             className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-2xl font-bold rounded shadow-sm transition-all flex flex-col items-center justify-center gap-1 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed group"
           >
              <PhoneCall size={32} className="animate-pulse mb-2" />
              Next
           </button>

           <button 
             onClick={handleFinish}
             disabled={!currentTicket || isLoading}
             className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xl font-bold rounded shadow-sm transition-all flex flex-col items-center justify-center uppercase tracking-wider disabled:opacity-50 disabled:bg-slate-300"
           >
              <CheckCircle size={28} className="mb-2"/>
              Finish
           </button>

           <button 
             onClick={handleCancel}
             disabled={!currentTicket || isLoading}
             className="flex-1 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-xl font-bold rounded shadow-sm transition-all flex flex-col items-center justify-center uppercase tracking-wider disabled:opacity-50 disabled:bg-slate-300"
           >
              <XCircle size={28} className="mb-2"/>
              Cancel
           </button>
        </section>

        {/* WAITING LIST */}
        <section className="col-span-12 md:col-span-6 lg:col-span-4 bg-white border border-slate-200 flex flex-col h-full">
           <div className="bg-indigo-600 text-white p-3 text-center font-bold text-sm uppercase tracking-wide">
              {waitingTickets.length} Visitors are waiting
           </div>

           <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50">
              {waitingTickets.length === 0 ? (
                 <div className="text-center text-slate-400 py-10 italic">No visitors waiting</div>
              ) : (
                 waitingTickets.map((t) => (
                    <div key={t.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm flex items-start gap-3 hover:border-indigo-300 transition-colors cursor-default">
                       {/* Số Queue */}
                       <div className="text-lg font-bold text-indigo-600 min-w-[3rem]">
                          {t.queueNumber}
                       </div>
                       <div className="flex-1 min-w-0">
                          {/* Tên Khách */}
                          <div className="font-bold text-slate-800 text-sm truncate uppercase mb-1">
                             {t.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                             <PhoneCall size={10}/> <span>{t.phone}</span>
                          </div>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </section>
      </main>
    </div>
  );
};

export default CounterPage;