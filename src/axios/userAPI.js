import axiosClient from "./axiosClient";

const userApi = {
  getAll: (page = 1, keyword = "") =>
  axiosClient.get(`/users?page=${page}&search=${keyword}`),
  
  createAdmin: (data) => axiosClient.post(`/users/createAdmin`, data),
  
  createStaff: (data) => axiosClient.post(`/users/createStaff`, data),

  update: (id, data) => axiosClient.patch(`/users/${id}`, data),

  getMe: () => axiosClient.get(`/users/me`),

  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
  
};

export default userApi;
