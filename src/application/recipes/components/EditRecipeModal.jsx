import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Chip, Stack, Typography
} from '@mui/material';
import { useState, useEffect } from 'react';

export default function EditRecipeModal({ open, onClose, onSubmit, recipe, loading }) {
  const [values, setValues] = useState({
    title: '',
    tags: [],
    ingredients: [],
    instructions: '',
    imageFile: null
  });

  const [tagInput, setTagInput] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (recipe) {
      setValues({
        title: recipe.title || '',
        tags: recipe.tags || [],
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || '',
        imageFile: null
      });
    }
  }, [recipe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setValues(v => ({ ...v, tags: [...v.tags, tagInput.trim()] }));
      setTagInput('');
      e.preventDefault();
    }
  };

  const handleDeleteTag = (index) => {
    setValues(v => ({
      ...v,
      tags: v.tags.filter((_, i) => i !== index)
    }));
  };

  const handleAddIngredient = (e) => {
    if (e.key === 'Enter' && ingredientInput.trim()) {
      setValues(v => ({ ...v, ingredients: [...v.ingredients, ingredientInput.trim()] }));
      setIngredientInput('');
      e.preventDefault();
    }
  };

  const handleDeleteIngredient = (index) => {
    setValues(v => ({
      ...v,
      ingredients: v.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageError('Please upload a valid image file.');
        setValues((v) => ({ ...v, imageFile: null }));
      } else {
        setImageError('');
        setValues((v) => ({ ...v, imageFile: file }));
      }
    }
  };

  const handleSubmit = () => {
    if (values.ingredients.length === 0) {
      alert('Please add at least one ingredient.');
      return;
    }

    if (imageError) {
      alert('Please fix the image error before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('_id', recipe._id); // ensure ID is included for backend

    Object.entries(values).forEach(([key, val]) => {
      if (key === 'tags' || key === 'ingredients') {
        val.forEach(item => formData.append(`${key}[]`, item));
      } else if (key === 'imageFile' && val) {
        formData.append('image', val); // name must match multer backend
      } else if (val !== null) {
        formData.append(key, val);
      }
    });

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Recipe</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          name="title"
          fullWidth
          margin="normal"
          value={values.title}
          onChange={handleChange}
        />

        <TextField
          label="Add ingredient (press Enter)"
          fullWidth
          margin="normal"
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
          onKeyDown={handleAddIngredient}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {values.ingredients.map((ing, i) => (
            <Chip
              key={i}
              label={ing}
              onDelete={() => handleDeleteIngredient(i)}
            />
          ))}
        </Stack>

        <TextField
          label="Instructions"
          name="instructions"
          fullWidth
          margin="normal"
          multiline
          value={values.instructions}
          onChange={handleChange}
        />

        <TextField
          label="Add tag (press Enter)"
          fullWidth
          margin="normal"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {values.tags.map((tag, i) => (
            <Chip
              key={i}
              label={tag}
              onDelete={() => handleDeleteTag(i)}
            />
          ))}
        </Stack>

        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            name="imageFile"
            onChange={handleFileChange}
          />
        </Button>

        {values.imageFile && !imageError && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected: {values.imageFile.name}
          </Typography>
        )}

        {imageError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {imageError}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
