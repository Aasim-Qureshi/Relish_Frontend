import axiosInstance from "../../../shared/api/axiosInstance";

const loginAPI = async (data) => {
  try {
    const response = await axiosInstance.post("/users/login", data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export default loginAPI;