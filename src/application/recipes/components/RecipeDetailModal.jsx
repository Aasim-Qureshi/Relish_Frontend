import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Chip, Box, Button, CardMedia
} from '@mui/material';
import ReactMarkdown from 'react-markdown';

export default function RecipeDetailModal({ open, onClose, recipe }) {
  if (!recipe) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{recipe.title}</DialogTitle>
      <DialogContent>
        {recipe.imageUrl && (
          <CardMedia
            component="img"
            height="180"
            image={recipe.imageUrl}
            alt={recipe.title}
            sx={{ mb: 2 }}
          />
        )}
        <Typography variant="subtitle1" gutterBottom>
          Ingredients:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {recipe.ingredients?.map((ing, i) => (
            <Chip key={i} label={ing} />
          ))}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Instructions:
        </Typography>
        <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
          <ReactMarkdown>{recipe.instructions}</ReactMarkdown>
        </Box>

        {recipe.tags?.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Tags:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {recipe.tags.map((t, i) => (
                <Chip key={i} label={t} size="small" />
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
