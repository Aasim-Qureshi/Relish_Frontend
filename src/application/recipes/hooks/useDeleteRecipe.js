import { useState } from 'react';
import deleteRecipeAPI from '../api/deleteRecipeAPI'; // Adjust the path as needed

export default function useDeleteRecipe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteRecipe = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteRecipeAPI(id);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to delete recipe');
      setLoading(false);
      return null;
    }
  };

  return { deleteRecipe, loading, error };
}
