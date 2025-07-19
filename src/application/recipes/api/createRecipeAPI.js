import axiosInstance from "../../../shared/api/axiosInstance";

const createRecipeAPI = async (data) => {
  try {
    const response = await axiosInstance.post("/recipes/create", data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export default createRecipeAPI;