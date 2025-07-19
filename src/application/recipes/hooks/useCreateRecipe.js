import { useState, useCallback } from 'react';
import createRecipeAPI from '../api/createRecipeAPI';

export default function useCreateRecipe(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRecipe = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    const res = await createRecipeAPI(formData);

    if (res.status === 'success') {
      onSuccess?.(res.data);
    } else {
      setError(res.message || 'Failed creating recipe');
    }

    setLoading(false);
  }, [onSuccess]);

  return { createRecipe, loading, error };
}
