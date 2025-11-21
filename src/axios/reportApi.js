import axiosClient from "./axiosClient";

const reportApi = {
  getSummary: () => axiosClient.get("/reports/summary"),

  getCustomerByDays: (days = 7) =>
    axiosClient.get(`/reports/customers-by-days?days=${days}`),

  getAllProjectsStats: (days = 7, includeEmpty = false) =>
    axiosClient.get(
      `/reports/all-projects-stats?days=${days}&includeEmpty=${includeEmpty}`
    ),

  getTicketStatusDistribution: (days) =>
    axiosClient.get("/reports/status-distribution", { params: { days } }),

  getTopServices: (days) =>
    axiosClient.get("/reports/top-services", { params: { days } }),

  getPeakHours: (days) =>
    axiosClient.get("/reports/peak-hours", { params: { days } }),
};

export default reportApi;
