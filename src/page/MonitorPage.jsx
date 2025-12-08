import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Monitor, 
  Settings, 
  LogOut, 
  ChevronRight, 
  RefreshCcw, 
  User, 
  Layers, 
  Menu,
  Play,
  AlertCircle
} from 'lucide-react';
import lineAPI from "../axios/lineAPI";
import ticketAPI from "../axios/ticketAPI";
import serviceApi from "../axios/serviceApi";
import { toast } from "react-toastify";

// --- PIP WINDOW COMPONENT ---
const PipControlWindow = ({ lineName, ticket, stats, onNext }) => {
  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-4 select-none box-border">
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
        <span className="text-xs font-bold text-indigo-400 uppercase">{lineName}</span>
        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-amber-400">Wait: {stats.waiting}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {ticket ? (
          <div className="animate-fadeIn">
             <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">SERVING</div>
             <h1 className="text-6xl font-black text-white mb-1 tracking-tighter">{ticket.user?.ticket_number}</h1>
             <p className="text-base text-indigo-300 font-medium truncate max-w-[200px]">{ticket.user?.name}</p>
          </div>
        ) : (
          <div className="text-slate-600 flex flex-col items-center"><Layers size={32} className="mb-2 opacity-30"/><span className="text-xs">Sẵn sàng</span></div>
        )}
      </div>
      <button onClick={onNext} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2">
        <Play size={20} fill="currentColor" /> {ticket ? "GỌI TIẾP" : "BẮT ĐẦU"}
      </button>
    </div>
  );
};

// --- NAV ITEM COMPONENT ---
const NavItem = ({ icon, label, active, isOpen, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 cursor-pointer transition-colors ${
      active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
    } ${!isOpen && 'justify-center'}`}
  >
    <span className={active ? 'text-blue-600' : 'text-gray-500'}>{icon}</span>
    {isOpen && <span>{label}</span>}
  </div>
);

// --- LINE CARD COMPONENT ---
const LineCard = ({ line, onOpenPiP, onClick }) => {
  const { name, stats, currentTicket, latestTickets } = line;
  const nextTickets = latestTickets.filter((t) => ['waiting', 'pending'].includes(t.status?.toLowerCase())).slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs text-gray-500 font-medium">Total: {stats.total}</span>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenPiP(line); }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Monitor size={18} />
        </button>
      </div>

      {/* Card Body - Current Ticket */}
      <div className="p-8 flex flex-col items-center justify-center text-center min-h-[160px]">
        {currentTicket ? (
          <div>
            <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mb-2 inline-block">Đang gọi</span>
            <div className="text-5xl font-black text-slate-900 tracking-tighter">{currentTicket.user?.ticket_number}</div>
            <div className="text-sm font-bold text-slate-500 mt-1">{currentTicket.user?.name}</div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Layers className="text-gray-300" size={32} />
            </div>
            <span className="text-gray-400 text-sm font-medium">Empty</span>
          </>
        )}
      </div>

      {/* Card Footer - Waiting Queue */}
      <div className="bg-gray-50 p-3 border-t border-gray-100">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs font-semibold text-gray-500 uppercase">Waiting queue</span>
          <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">{stats.waiting}</span>
        </div>

        {/* Preview waiting tickets */}
        {nextTickets.length > 0 && (
          <div className="space-y-1 mb-2">
            {nextTickets.map((t, idx) => (
              <div key={t.id} className="flex items-center gap-2 text-xs bg-white p-1.5 rounded border border-gray-200">
                <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                <span className="font-bold text-gray-700">{t.user?.ticket_number}</span>
              </div>
            ))}
          </div>
        )}

        <button className="w-full py-2 flex items-center justify-center gap-1 text-sm font-medium text-blue-600 bg-white border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
          Manage <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const MonitorPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [services, setServices] = useState([]);
  const [activeService, setActiveService] = useState("");
  const [linesData, setLinesData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [pipWindow, setPipWindow] = useState(null);
  const [pipLineId, setPipLineId] = useState(null);

  // Load Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceApi.getService();
        let list = [];
        if (res.data && Array.isArray(res.data.data)) list = res.data.data;
        else if (res.data?.data?.services) list = res.data.data.services;
        else if (Array.isArray(res.data)) list = res.data;

        setServices(list);
        if (list.length > 0) setActiveService(list[0].id);
      } catch (err) {
        toast.error("Error get services lists");
      }
    };
    fetchServices();
  }, []);

  // Fetch Lines Data
  const fetchData = useCallback(async () => {
    if (!activeService) return;
    
    setLoading(true);
    try {
      const resLines = await lineAPI.getLine(activeService);
      let rawLines = [];
      if (resLines.data?.data) {
        rawLines = Array.isArray(resLines.data.data) ? resLines.data.data : resLines.data.data.lines || [];
      }

      const fullData = await Promise.all(rawLines.map(async (line) => {
        try {
          const resTickets = await ticketAPI.getAll(line.id, { limit: 50 });
          let all = resTickets.data?.data?.tickets || [];
          if (!Array.isArray(all) && resTickets.data?.data) all = resTickets.data.data;

          const serving = all.find(t => ['serving', 'processing'].includes(t.status?.toLowerCase()));
          const waiting = all.filter(t => ['waiting', 'pending'].includes(t.status?.toLowerCase()));

          return {
            id: line.id,
            name: line.name,
            stats: {
              total: (serving ? 1 : 0) + waiting.length,
              waiting: waiting.length,
              serving: serving ? 1 : 0
            },
            currentTicket: serving || null,
            latestTickets: waiting
          };
        } catch (e) {
          return { id: line.id, name: line.name, stats: { total: 0, waiting: 0 }, currentTicket: null, latestTickets: [] };
        }
      }));

      setLinesData(fullData);
    } catch (err) {
      console.error("Lỗi fetch monitor:", err);
    } finally {
      setLoading(false);
    }
  }, [activeService]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handlers
  const handleNext = async (lineId) => {
    try {
      await ticketAPI.putTicket(lineId);
      toast.success("already called");
      fetchData();
    } catch (e) {
      toast.error("error or out of orders");
    }
  };

  const openPiP = async (line) => {
    if (pipWindow) { pipWindow.close(); setPipWindow(null); setPipLineId(null); }
    if ("documentPictureInPicture" in window) {
      try {
        const pip = await window.documentPictureInPicture.requestWindow({ width: 300, height: 400 });
        [...document.styleSheets].forEach((s) => {
          try { pip.document.head.appendChild(s.ownerNode.cloneNode(true)); } catch (e) {}
        });
        pip.addEventListener("pagehide", () => { setPipWindow(null); setPipLineId(null); });
        setPipWindow(pip);
        setPipLineId(line.id);
      } catch (err) { console.error(err); }
    } else { toast.error("brownser no support PiP"); }
  };

  const handleLineClick = (lineId) => {
  // Tìm line info từ linesData
  const selectedLine = linesData.find(l => l.id === lineId);
  
  // Pass qua state
  navigate(`/counter?lineId=${lineId}`, {
    state: {
      lineInfo: {
        id: selectedLine.id,
        name: selectedLine.name,
        stats: selectedLine.stats
      }
    }
  });
};

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const activePipLineData = linesData.find(l => l.id === pipLineId);
  const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const currentServiceName = services.find(s => s.id === activeService)?.name || "Service";

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* PiP Portal */}
      {pipWindow && activePipLineData && createPortal(
        <PipControlWindow
          lineName={activePipLineData.name}
          ticket={activePipLineData.currentTicket}
          stats={activePipLineData.stats}
          onNext={() => handleNext(activePipLineData.id)}
        />,
        pipWindow.document.body
      )}

      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-10`}>
        
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <LayoutDashboard />
            {isSidebarOpen && <span>SmartQ</span>}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-6">
            <p className={`text-xs font-semibold text-gray-400 mb-2 ${!isSidebarOpen && 'text-center'}`}>
              {isSidebarOpen ? 'Main menu' : '---'}
            </p>
            <NavItem icon={<Monitor size={20} />} label="Monitor Center" isOpen={isSidebarOpen} active />
            <NavItem icon={<Settings size={20} />} label="Cấu hình" isOpen={isSidebarOpen} />
          </div>

          {/* Services List */}
          <div className="px-4">
            <p className={`text-xs font-semibold text-gray-400 mb-2 ${!isSidebarOpen && 'hidden'}`}>
                Services list
            </p>
            <div className="space-y-1">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => { setActiveService(svc.id); setLinesData([]); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${activeService === svc.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}
                    ${!isSidebarOpen ? 'justify-center' : ''}
                  `}
                >
                  <Layers size={18} className={activeService === svc.id ? 'text-blue-600' : 'text-gray-400'} />
                  {isSidebarOpen && <div className="flex-1 text-left truncate">{svc.name}</div>}
                  {isSidebarOpen && activeService === svc.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
            {isSidebarOpen && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name || "User"}</p>
                  <p className="text-xs text-gray-500">{currentUser.role || "Staff"}</p>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{currentServiceName}</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                System is working
              </p>
            </div>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200 disabled:opacity-50">
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Re-new
          </button>
        </header>

        {/* Dashboard Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {!activeService ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Please choose your services</p>
            </div>
          ) : linesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {linesData.map(line => (
                <LineCard
                  key={line.id}
                  line={line}
                  onOpenPiP={openPiP}
                  onClick={() => handleLineClick(line.id)}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p>There is no line existing for this services</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MonitorPage;