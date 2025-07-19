import { useState } from 'react';
import updateRecipeAPI from '../api/updateRecipeAPI';

export default function useUpdateRecipe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateRecipe = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateRecipeAPI(data);
      return result;
    } catch (err) {
      setError(err?.response?.data || { message: 'Something went wrong' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateRecipe, loading, error };
}
