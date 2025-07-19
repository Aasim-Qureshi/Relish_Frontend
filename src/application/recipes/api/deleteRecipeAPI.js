import axiosInstance from "../../../shared/api/axiosInstance";

const deleteRecipeAPI = async (id) => {

  try {
    const response = await axiosInstance.delete(`/recipes/delete/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export default deleteRecipeAPI;