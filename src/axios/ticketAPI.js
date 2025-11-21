import axiosClient from "./axiosClient";

const ticketAPI = {
  // Updated to accept params (page, limit, status, search)
  getAll: (lineId, params) => 
    axiosClient.get(`/tickets/line/${lineId}`, { params }),

  putTicket: (lineId) => axiosClient.put(`/tickets/call-next/${lineId}`),

  putFinish: (ticketId) => axiosClient.put(`/tickets/finish/${ticketId}`),

  putCancel: (ticketId) => axiosClient.put(`/tickets/cancel/${ticketId}`),
}

export default ticketAPI;