import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Typography,
  Container,
  ButtonGroup,
  Button
} from '@mui/material';
import SearchBar from '../components/SearchBar';
import RecipeList from '../components/RecipeList';
import CreateRecipeModal from '../components/CreateRecipeModal';
import GenerateRecipeModal from '../components/GenerateRecipeModal';
import EditRecipeModal from '../components/EditRecipeModal';
import RecipeDetailModal from '../components/RecipeDetailModal';
import useAllRecipes from '../hooks/useAllRecipes';
import useMyRecipes from '../hooks/useMyRecipes';
import useCreateRecipe from '../hooks/useCreateRecipe';
import useGenerateRecipe from '../hooks/useGenerateRecipe';
import useUpdateRecipe from '../hooks/useUpdateRecipe';

export default function RecipeDashboard({ userId }) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openGen, setOpenGen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);


  const {
    recipes: allRecipes,
    loading: allLoading,
    error: allError,
    refetch: refetchAllRecipes
  } = useAllRecipes();

  const {
    recipes: myRecipes,
    loading: myLoading,
    error: myError,
    refetch: refetchMyRecipes
  } = useMyRecipes();

  const { createRecipe } = useCreateRecipe();
  const { generateRecipe } = useGenerateRecipe();
  const { updateRecipe, loading: updateLoading } = useUpdateRecipe();

  const recipes = tab === 0 ? myRecipes : allRecipes;
  const loading = tab === 0 ? myLoading : allLoading;
  const error = tab === 0 ? myError : allError;

  const filtered = recipes.filter(r => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    if (term.startsWith('#')) {
      const tag = term.slice(1);
      return r.tags?.some(t => t.toLowerCase().includes(tag));
    }
    return r.title.toLowerCase().includes(term);
  });

  const handleCreate = async formData => {
    try {
      setCreateLoading(true);
      await createRecipe(formData);
      await Promise.all([refetchAllRecipes(), refetchMyRecipes()]);
      setOpenCreate(false);
    } catch (err) {
      console.error('Failed to create recipe:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleGenerate = async ingredients => {
    try {
      setGenerateLoading(true);
      await generateRecipe({ ingredients });
      await Promise.all([refetchAllRecipes(), refetchMyRecipes()]);
      setOpenGen(false);
    } catch (err) {
      console.error('Failed to generate recipe:', err);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      await updateRecipe(updatedData);
      await Promise.all([refetchAllRecipes(), refetchMyRecipes()]);
      setEditingRecipe(null); // Close modal after success
    } catch (err) {
      console.error('Failed to update recipe:', err);
    }
  };


  const handleDeleted = (deletedId) => {
    refetchAllRecipes();
    refetchMyRecipes();
  };


  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ButtonGroup
          variant="contained"
          disableElevation
          sx={{ borderRadius: '40px', overflow: 'hidden' }}
        >
          <Button
            onClick={() => setOpenCreate(true)}
            disabled={createLoading}
            sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            {createLoading ? '...' : 'Create Recipe'}
          </Button>
          <Button
            onClick={() => setOpenGen(true)}
            disabled={generateLoading}
            sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            {generateLoading ? '...' : 'Generate Recipe'}
          </Button>
        </ButtonGroup>
      </Box>

      <SearchBar value={search} onChange={e => setSearch(e.target.value)} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab label="My Recipes" />
        <Tab label="All Recipes" />
      </Tabs>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />}
      {error && (
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      )}
      {!loading && !error && (
        <RecipeList
          recipes={filtered}
          onSelect={setSelectedRecipe}
          onDeleted={handleDeleted}
          onEdit={setEditingRecipe}
        />


      )}

      <CreateRecipeModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
        loading={createLoading}
      />
      <GenerateRecipeModal
        open={openGen}
        onClose={() => setOpenGen(false)}
        onSubmit={handleGenerate}
        loading={generateLoading}
      />

      <RecipeDetailModal
        open={!!selectedRecipe}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      <EditRecipeModal
        open={!!editingRecipe}
        onClose={() => setEditingRecipe(null)}
        onSubmit={handleUpdate}
        recipe={editingRecipe}
        loading={updateLoading}
      />

    </Container>
  );
}
