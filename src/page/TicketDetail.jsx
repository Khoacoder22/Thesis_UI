import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const TicketDetail = () => {
  const { ticketId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialTicket = location.state?.ticket || null;

  const [ticket, setTicket] = useState(initialTicket);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/tickets/id/${ticketId}`
        );
        setTicket(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load ticket details. It may have expired or is invalid.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    if (!ticket?.id) return;
    
    console.log("🔌 Initializing WebSocket connection...");
    const socketUrl = process.env.REACT_APP_API_URL.replace('/api', '');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket connected! Socket ID:", socket.id);
      socket.emit("join_ticket", { ticketId: ticket.id });
      console.log("📤 Emitted join_ticket event for ticket:", ticket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
    });

    socket.on("ticket_updated", (data) => {
      console.log("📨 Received ticket_updated event:", data);
      
      setTicket((prevTicket) => ({
        ...prevTicket,
        status: data.status || prevTicket.status,
        waiting_time: data.waiting_time ?? prevTicket.waiting_time,
        positionInQueue: data.positionInQueue ?? prevTicket.positionInQueue,
      }));

      // Chỉ hiển thị notification khi status chuyển sang 'serving' của chính vé này
      if (data.status === 'serving' && data.ticketId === ticket.id) {
        setNotification({
          type: 'success',
          message: data.message || "Please proceed to the counter"
        });

        // // Phát âm thanh thông báo (bỏ comment nếu bạn có file notification.mp3 trong public folder)
        // const audio = new Audio('/notification.mp3');
        // audio.play().catch(e => console.log('Audio play failed:', e));

        // Tự động ẩn notification sau 15 giây
        setTimeout(() => {
          setNotification(null);
        }, 15000);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 WebSocket connection error:", error);
    });

    return () => {
      console.log("🔌 Cleaning up WebSocket connection...");
      socket.disconnect();
    };
  }, [ticket?.id]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "serving":
        return "bg-green-100 text-green-800";
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "finished":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Loading Ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center animate-fade-in-up max-w-sm">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans flex items-center justify-center">
      {/* Notification Popup - New Design */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
          <div className="relative w-full max-w-xs mx-auto animate-scale-in">
            {/* Ticket Body */}
            <div className="bg-white rounded-t-2xl p-8 text-center shadow-2xl">
              <p className="font-semibold text-green-600">IT'S YOUR TURN!</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">Please Proceed To</h2>
              <p className="text-5xl font-black text-blue-600 my-4 tracking-tight">{ticket.line_name}</p>
            </div>
            
            {/* Dashed Line Separator */}
            <div className="relative h-1 bg-white shadow-2xl">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-gray-300"></div>
              </div>
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full"></div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full"></div>
            </div>

            {/* Ticket Stub */}
            <div className="bg-white rounded-b-2xl p-6 text-center shadow-2xl">
              <p className="text-sm text-gray-500">Your Number</p>
              <p className="text-7xl font-extrabold text-gray-800 tracking-tighter">{ticket.queueNumber}</p>
              <button
                onClick={() => setNotification(null)}
                className="mt-6 w-full bg-green-500 text-white py-3 rounded-lg font-bold text-base shadow-lg hover:bg-green-600 transform hover:scale-105 transition-all"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Your Queue Number</p>
              <p className="text-5xl font-extrabold text-gray-800 mt-1">{ticket.queueNumber || 'N/A'}</p>
            </div>
            <div className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(ticket.status)}`}>
              {ticket.status}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Wait Time */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-gray-500">Estimated Wait Time</p>
            <div className="flex items-end justify-center gap-1 mt-1">
              <span className="text-6xl font-bold text-blue-600 leading-none animate-pulse">
                {ticket.waiting_time ?? 0}
              </span>
              <span className="text-2xl font-medium text-gray-400 pb-1">min</span>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-3 border-t border-b border-gray-200 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service</span>
              <span className="font-semibold text-gray-900 text-right">{ticket.serviceName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Counter</span>
              <span className="font-semibold text-gray-900">{ticket.line_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">People Ahead</span>
              <span className="font-semibold text-gray-900">{ticket.positionInQueue ?? ticket.queue_length_at_join ?? 0}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Name</span>
              <span className="font-semibold text-gray-900">{ticket.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Phone</span>
              <span className="font-semibold text-gray-900">{ticket.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Joined at {new Date(ticket.joined_at).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">Ticket ID: #{ticket.id}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;