import { useState, useCallback } from 'react';
import generateRecipeAPI from '../api/generateRecipeAPI';

export default function useGenerateRecipe(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRecipe = useCallback(async (ingredients) => {
    setLoading(true);
    setError(null);
    const res = await generateRecipeAPI({ ingredients });

    if (res.status === 'success') {
      onSuccess?.(res.data);
    } else {
      setError(res.message || 'Failed generating recipe');
    }

    setLoading(false);
  }, [onSuccess]);

  return { generateRecipe, loading, error };
}
