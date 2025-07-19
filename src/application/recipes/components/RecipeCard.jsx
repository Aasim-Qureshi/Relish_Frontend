import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  ButtonBase,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import ReactMarkdown from 'react-markdown';
import useDeleteRecipe from '../hooks/useDeleteRecipe';

export default React.memo(function RecipeCard({ recipe, onClick, onDeleted, onEdit }) {
  const { deleteRecipe, loading } = useDeleteRecipe();

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = confirm("Are you sure you want to delete this recipe?");
    if (!confirmed) return;

    const result = await deleteRecipe(recipe._id);

    if (result?.status === "success") {
      onDeleted?.(recipe._id);
    } else {
      alert("Failed to delete recipe.");
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(recipe);
  };

  const previewText = recipe.instructions?.slice(0, 120) + (recipe.instructions?.length > 120 ? '...' : '');

  return (
    <ButtonBase onClick={onClick} sx={{ width: '100%', textAlign: 'left', position: 'relative' }}>
      <Card sx={{ width: '100%' }}>
        {recipe.imageUrl && (
          <CardMedia
            component="img"
            height="140"
            image={recipe.imageUrl}
            alt={recipe.title}
          />
        )}

        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" gutterBottom>
              {recipe.title}
            </Typography>
            <Box>
              <IconButton size="small" onClick={handleEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleDelete} disabled={loading}>
                {loading ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              typography: 'body2',
              color: 'text.secondary',
              overflow: 'hidden'
            }}
          >
            <ReactMarkdown>{previewText}</ReactMarkdown>
          </Box>

          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {recipe.tags?.map((t) => (
              <Chip key={t} label={t} size="small" />
            ))}
          </Box>
        </CardContent>
      </Card>
    </ButtonBase>
  );
});
