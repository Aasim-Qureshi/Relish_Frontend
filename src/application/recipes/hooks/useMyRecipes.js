import { useState, useCallback, useEffect } from 'react';
import myRecipesAPI from '../api/myRecipesAPI';

export default function useMyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await myRecipesAPI();
    if (res.status === 'success') {
      setRecipes(res.data);
    } else {
      setError(res.message || 'Failed to fetch my recipes');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMyRecipes();
  }, [fetchMyRecipes]);

  return { recipes, loading, error, refetch: fetchMyRecipes };
}
