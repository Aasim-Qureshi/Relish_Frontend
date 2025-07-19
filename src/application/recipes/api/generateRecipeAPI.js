import axiosInstance from "../../../shared/api/axiosInstance";

const generateRecipeAPI = async (data) => {

    console.log("data", data)

  try {
    const response = await axiosInstance.post("/recipes/generate", data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export default generateRecipeAPI;