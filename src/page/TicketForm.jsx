import React, { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TicketForm = () => {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const serviceName = location.state?.serviceName || "Service";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/tickets`, {
        serviceId,
        name,
        phone,
      });

      // redirect to ticket detail page
      navigate(`/ticket/${res.data.data.id}`, {
        state: { ticket: res.data.data },
      });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create ticket. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-6 sm:p-8 animate-fade-in-up">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Get Your Ticket</h1>
          <p className="text-md text-gray-500 mt-1">
            For: <span className="font-semibold text-blue-600">{serviceName}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="Your contact number"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                "Create Ticket"
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketForm;