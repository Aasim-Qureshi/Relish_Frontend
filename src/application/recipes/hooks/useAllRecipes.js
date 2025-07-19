import { useState, useCallback, useEffect } from 'react';
import allRecipesAPI from '../api/allRecipesAPI';

export default function useAllRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await allRecipesAPI();
    if (res.status === 'success') {
      setRecipes(res.data);
    } else {
      setError(res.message || 'Failed to fetch recipes');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return { recipes, loading, error, refetch: fetchRecipes };
}
