import axiosClient from "./axiosClient";

const authAPI = {
    login: (email, password) => {
        return axiosClient.post("/auth/login", {email, password});
    },
};

export default authAPI;