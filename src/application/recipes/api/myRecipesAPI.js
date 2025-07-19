import axiosInstance from '../../../shared/api/axiosInstance';

const myRecipesAPI = async () => {
  try {
    const response = await axiosInstance.get(`/recipes/current`);
    return response.data;
  } catch (error) {
    return error.response?.data || { status: 'error', message: error.message };
  }
};

export default myRecipesAPI;
