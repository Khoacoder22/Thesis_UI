import axiosClient from "./axiosClient";

const staffAPI = {
  getAll: (page = 1 ,search = "") =>
    axiosClient.get(`/users/staff`, { params: {page, limit: 5, search } }),

  create: (data) =>
    axiosClient.post(`/users/createStaff`, data),

  delete: (id) => axiosClient.delete(`/users/staff/${id}`),

  update: (id, data) => axiosClient.patch(`/users/staff/${id}`, data),
};

export default staffAPI;
