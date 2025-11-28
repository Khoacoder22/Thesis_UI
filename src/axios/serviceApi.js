import axiosClient from "./axiosClient";

const serviceApi = {
  // SỬA DÒNG NÀY: Thêm tham số limit = 6 (mặc định)
  getService: (page = 1, search = "", limit = 6) =>
    axiosClient.get(`/services`, {
      // Truyền limit động vào params
      params: { page, limit, search },
    }),

  createService: (data) => axiosClient.post(`/services`, data),

  update: (id, data) => axiosClient.patch(`/services/${id}`, data),

  deleteService: (id) => axiosClient.delete(`/services/${id}`),
};

export default serviceApi;