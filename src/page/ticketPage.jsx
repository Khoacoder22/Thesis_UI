import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, PhoneCall } from "lucide-react";
import ticketAPI from "../axios/ticketAPI";
import serviceApi from "../axios/serviceApi";
import lineAPI from "../axios/lineAPI";
import { toast } from "react-toastify";

const TicketPage = () => {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");

  const [lines, setLines] = useState([]);
  const [lineId, setLineId] = useState("");

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // -------------------------------
  // LOAD SERVICES
  // -------------------------------
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await serviceApi.getService();
        setServices(res.data.data || []);
      } catch (err) {
        toast.error("Cannot load services!");
      }
    };
    loadServices();
  }, []);

  // -------------------------------
  // LOAD LINES WHEN SERVICE SELECTED
  // -------------------------------
  useEffect(() => {
    if (!serviceId) return;

    const loadLines = async () => {
      try {
        const res = await lineAPI.getLine(serviceId);
        setLines(res.data.data?.lines || []);
      } catch (err) {
        toast.error("Cannot load lines!");
      }
    };

    loadLines();
  }, [serviceId]);

  // -------------------------------
  // LOAD TICKETS WHEN LINE SELECTED
  // -------------------------------
  const fetchTickets = useCallback(async () => {
    if (!lineId) return;

    try {
      const res = await ticketAPI.getAll(lineId);
      setTickets(res.data.data?.tickets || []);
    } catch (err) {
      console.error("Fetch ticket error:", err);
      toast.error("Cannot load tickets!");
    }
  }, [lineId]);

  useEffect(() => {
    fetchTickets();
  }, [lineId]);

  // -------------------------------
  // CALL NEXT
  // -------------------------------
  const handleCallNext = async () => {
    if (!lineId) return toast.error("Please select a line!");

    try {
      const res = await ticketAPI.putTicket(lineId);
      toast.success(res.data.message || "Next ticket called!");
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Call next failed!");
    }
  };

  // -------------------------------
  // FINISH
  // -------------------------------
  const handleFinish = async () => {
    if (!selectedTicket) return toast.error("Please select a ticket!");

    try {
      const res = await ticketAPI.putFinish(selectedTicket);
      toast.success(res.data.message || "Ticket finished!");
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Finish failed!");
    }
  };

  // -------------------------------
  // CANCEL
  // -------------------------------
  const handleCancel = async () => {
    if (!selectedTicket) return toast.error("Please select a ticket!");

    try {
      const res = await ticketAPI.putCancel(selectedTicket);
      toast.success(res.data.message || "Ticket canceled!");
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed!");
    }
  };

  // -------------------------------
  // STATUS BADGE STYLE
  // -------------------------------
  const statusBadge = (status) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "serving":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "done":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      
      {/* LEFT SIDE */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🎟 Tickets</h2>

        {/* DROPDOWNS */}
        <div className="mb-4 space-y-3">

          {/* SERVICE DROPDOWN */}
          <select
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setLineId("");
              setTickets([]);
            }}
          >
            <option value="">-- Select Service --</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* LINE DROPDOWN */}
          <select
            className="w-full px-3 py-2 border rounded-lg shadow-sm"
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
            disabled={!serviceId}
          >
            <option value="">-- Select Line --</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* TICKET LIST */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm ${
                selectedTicket === t.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg text-gray-800">#{t.number}</p>
                  <p className="text-sm text-gray-500">ID: {t.id}</p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(t.status)}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE ACTIONS */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-gray-800">Actions</h2>

        <button
          onClick={handleCallNext}
          className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all"
        >
          <PhoneCall size={20} />
          Call Next
        </button>

        <button
          onClick={handleFinish}
          className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg transition-all"
        >
          <CheckCircle size={20} />
          Finish Ticket
        </button>

        <button
          onClick={handleCancel}
          className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg transition-all"
        >
          <XCircle size={20} />
          Cancel Ticket
        </button>

        <div className="mt-2 p-4 bg-gray-100 rounded-xl text-sm border shadow-inner">
          <p>
            <b>Selected Ticket:</b>{" "}
            <span className="text-blue-700 font-semibold">
              {selectedTicket || "None"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
