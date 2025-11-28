import axiosClient from "./axiosClient";

const userApi = {
  // getAll: (page = 1, keyword = "", limit = 4) =>
  // axiosClient.get(`/users?page=${page}&search=${keyword}&limit=${limit}`),
  getAll: (page = 1, keyword = "", limit = 8, role = "") =>
    axiosClient.get(`/users`, {
      params: {
        page,
        search: keyword,
        limit,
        role: role || undefined // Chỉ truyền role nếu có giá trị
      }
    }),
  
  createAdmin: (data) => axiosClient.post(`/users/createAdmin`, data),
  
  createStaff: (data) => axiosClient.post(`/users/createStaff`, data),

  update: (id, data) => axiosClient.patch(`/users/${id}`, data),

  getMe: () => axiosClient.get(`/users/me`),

  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
  
};

export default userApi;
