import axiosClient from "./axiosClient";

const projectApi = {
  getAll: (page = 1, search = "") =>
    axiosClient.get(`/projects`, {
      params: { page, limit: 16, search },
    }),

  create: (data) => axiosClient.post(`/projects`, data),

  update: (id, data) => axiosClient.patch(`/projects/${id}`, data),

  delete: (id) => axiosClient.delete(`/projects/${id}`),
};

export default projectApi;
