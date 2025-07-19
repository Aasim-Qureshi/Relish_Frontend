import { Box } from '@mui/material';
import RecipeCard from './RecipeCard';

export default function RecipeList({ recipes, onSelect, onDeleted, onEdit }) {
  if (recipes.length === 0) return <div>No recipes found.</div>;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 2,
        px: 2,
        py: 3,
      }}
    >
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={recipe._id || index}
          recipe={recipe}
          onClick={() => onSelect(recipe)}
          onDeleted={onDeleted}
          onEdit={onEdit} 
        />
      ))}
    </Box>
  );
}
