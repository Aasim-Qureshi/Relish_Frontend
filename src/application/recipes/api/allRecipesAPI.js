import axiosInstance from '../../../shared/api/axiosInstance';

const allRecipesAPI = async () => {
  try {
    const response = await axiosInstance.get('/recipes/all');
    console.log(response.data)
    return response.data;
  } catch (error) {
    return error.response?.data || { status: 'error', message: error.message };
  }
};

export default allRecipesAPI;
