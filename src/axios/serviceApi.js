import axiosClient from "./axiosClient";

const serviceApi = {
  getService: (page = 1, search = "") =>
  axiosClient.get(`/services`, {
      params: { page, limit: 6, search },
    }),
  
  createService: (data) => axiosClient.post(`/services`, data),
  
  update: (id, data) => axiosClient.patch(`/services/${id}`, data),

  deleteService: (id) => axiosClient.delete(`/services/${id}`),
  
};

export default serviceApi;
