import axiosClient from "./axiosClient";

const projectApi = {
  getAll: (page = 1, search = "") =>
    axiosClient.get(`/projects`, {
      params: { page, limit: 16, search },
    }),

  create: (data) => axiosClient.post(`/projects`, data),

  update: (id, data) => axiosClient.patch(`/projects/${id}`, data),

  delete: (id) => axiosClient.delete(`/projects/${id}`),

  getUnassigned: (adminId, search = "") =>
  axiosClient.post(`/projects/${adminId}/assign-project`, {
      params: { search },
    }),

  getUnassigned: () => axiosClient.get(`/projects/unassigned/projects`),

  assignToUser: (userId, projectName) =>
  axiosClient.post(`/projects/assign-project`, {
    userId,
    projectName,
  }),

};

export default projectApi;
