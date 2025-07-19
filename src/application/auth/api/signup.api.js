import axiosInstance from "../../../shared/api/axiosInstance";

const signupAPI = async (data) => {
  try {
    const response = await axiosInstance.post("/users/signup", data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export default signupAPI;