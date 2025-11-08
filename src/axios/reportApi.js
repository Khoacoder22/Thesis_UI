import axiosClient from "./axiosClient";

const reportApi = {
  getSummary: () => axiosClient.get(`/reports/summary`),
  getProjectCustomerStats: () =>
    axiosClient.get(`/reports/mock/projects-customers-fixed`)
};

export default reportApi;
