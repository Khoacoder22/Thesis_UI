import axiosClient from "./axiosClient";

const staffAPI = {
  getAll: (search = "") =>
    axiosClient.get(`/staff`, { params: { search } }),

  create: (data) =>
    axiosClient.post(`/staff`, data),
};

export default staffAPI;
