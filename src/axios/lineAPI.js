import axiosClient from "./axiosClient";

const lineAPI = {
    postLine : (data) => axiosClient.post(`/lines`, data),

    getLine : (serviceId) => axiosClient.get(`/lines/${serviceId}`),

    updateLine: (id, data) => axiosClient.patch(`/lines/${id}`, data),

    deleteLine: (id) => axiosClient.delete(`/lines/${id}`)
}

export default lineAPI;