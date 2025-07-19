import axiosInstance from "../../../shared/api/axiosInstance"; 

const updateRecipeAPI = async (formData) => {
  const id = formData.get('_id'); 

  try {
    const response = await axiosInstance.patch(`/recipes/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    return error.response?.data || { status: "error", message: "Unknown error" };
  }
};

export default updateRecipeAPI;
