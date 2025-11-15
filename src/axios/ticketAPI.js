import axiosClient from "./axiosClient";

const ticketAPI = {
    getAll: (lineId) => 
    axiosClient.get(`/tickets/line/${lineId}`),

    putTicket: (lineId) => axiosClient.put(`/tickets/call-next/${lineId}`),

    putFinish: (ticketId) => axiosClient.put(`/tickets/finish/${ticketId}`),

    putCancel: (ticketId) => axiosClient.put(`/tickets/cancel/${ticketId}`),
}

export default ticketAPI;