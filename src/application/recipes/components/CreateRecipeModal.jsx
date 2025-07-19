import { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Chip, Stack, Typography
} from '@mui/material';

export default function CreateRecipeModal({ open, onClose, onSubmit, loading }) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

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

  // Initialize speech recognition once
  useEffect(() => {
    const checkSpeechSupport = async () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.log('SpeechRecognition not available');
        setSpeechSupported(false);
        return;
      }

      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.log('HTTPS required for speech recognition');
        setSpeechSupported(false);
        return;
      }

      // Check if we have microphone permissions
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop the stream immediately - we just needed to check permission
          stream.getTracks().forEach(track => track.stop());
          setSpeechSupported(true);
        } else {
          setSpeechSupported(false);
        }
      } catch (error) {
        console.warn('Microphone permission check failed:', error);
        setSpeechSupported(false);
      }
    };

    checkSpeechSupport();
  }, []);

  const handleVoiceInput = async (type) => {
    // Additional checks
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert('Speech recognition requires HTTPS or localhost.');
      return;
    }

    if (!speechSupported) {
      alert('Speech recognition not supported or microphone permission denied.');
      return;
    }

    // If currently listening, stop
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Check if browser is online
    if (!navigator.onLine) {
      alert('Speech recognition requires an internet connection.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // Clean up any existing recognition
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }

      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition with more reliable settings
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
          alert('Speech recognition timed out. Please try again.');
        }
      }, 30000); // 30 second timeout

      setIsListening(true);

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started successfully');
      };

      recognitionRef.current.onresult = (event) => {
        clearTimeout(timeout);
        try {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript.trim();
            console.log('Speech result:', transcript);
            
            if (transcript) {
              if (type === 'ingredient') {
                const ingredients = transcript
                  .split(/[,;]/)
                  .map(item => item.trim())
                  .filter(item => item.length > 0);
                
                setValues(v => ({ 
                  ...v, 
                  ingredients: [...v.ingredients, ...ingredients] 
                }));
              } else if (type === 'tag') {
                const tags = transcript
                  .split(/[,;]/)
                  .map(item => item.trim())
                  .filter(item => item.length > 0);
                
                setValues(v => ({ 
                  ...v, 
                  tags: [...v.tags, ...tags] 
                }));
              }
            }
          }
        } catch (error) {
          console.error('Error processing speech result:', error);
          alert('Error processing speech. Please try again.');
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        clearTimeout(timeout);
        console.error('Speech recognition error:', event.error, event);
        setIsListening(false);
        
        let errorMessage = '';
        switch(event.error) {
          case 'network':
            errorMessage = 'Network error occurred. Check your internet connection and try again. Make sure you\'re not using a VPN or proxy that might block speech services.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions and refresh the page.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone detected. Please connect a microphone and refresh the page.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech service blocked. Ensure you\'re using HTTPS and try refreshing the page.';
            break;
          case 'bad-grammar':
            errorMessage = 'Speech recognition service error. Please try again.';
            break;
          case 'language-not-supported':
            errorMessage = 'Language not supported by speech recognition service.';
            break;
          case 'aborted':
            // Don't show error for user-initiated stops
            return;
          default:
            errorMessage = `Speech recognition failed (${event.error}). Please try again or check your internet connection.`;
        }
        
        if (errorMessage) {
          alert(errorMessage);
        }
      };

      recognitionRef.current.onend = () => {
        clearTimeout(timeout);
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      // Start recognition with error handling
      try {
        recognitionRef.current.start();
      } catch (error) {
        clearTimeout(timeout);
        console.error('Failed to start speech recognition:', error);
        setIsListening(false);
        alert('Failed to start speech recognition. Please try again.');
      }

    } catch (error) {
      console.error('Speech recognition setup error:', error);
      setIsListening(false);
      alert('Unable to initialize speech recognition. Please check your browser settings.');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

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
    Object.entries(values).forEach(([k, val]) => {
      if (k === 'tags' || k === 'ingredients') {
        val.forEach(item => formData.append(`${k}[]`, item));
      } else if (k === 'imageFile') {
        formData.append('image', val);
      } else if (val !== null) {
        formData.append(k, val);
      }
    });

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Recipe</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          name="title"
          fullWidth
          margin="normal"
          value={values.title}
          onChange={handleChange}
        />

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label="Add ingredient (press Enter)"
            fullWidth
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={handleAddIngredient}
          />
          <Button 
            variant={isListening ? "contained" : "outlined"}
            color={isListening ? "secondary" : "primary"}
            onClick={() => handleVoiceInput('ingredient')}
            disabled={!speechSupported}
            title={speechSupported ? "Click to use voice input" : "Speech recognition not available"}
          >
            {isListening ? '⏹️' : '🎤'}
          </Button>
        </Stack>
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

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label="Add tag (press Enter)"
            fullWidth
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          <Button 
            variant={isListening ? "contained" : "outlined"}
            color={isListening ? "secondary" : "primary"}
            onClick={() => handleVoiceInput('tag')}
            disabled={!speechSupported}
            title={speechSupported ? "Click to use voice input" : "Speech recognition not available"}
          >
            {isListening ? '⏹️' : '🎤'}
          </Button>
        </Stack>
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

        {!speechSupported && (
          <Typography variant="body2" color="warning" sx={{ mt: 1 }}>
            Speech recognition not available. Please ensure you're using HTTPS (or localhost), have microphone permissions, and a stable internet connection.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}