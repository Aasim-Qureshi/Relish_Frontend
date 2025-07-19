import { ButtonGroup, Button } from '@mui/material';

export default function RecipeActions({ onCreate, onGenerate, loadingCreate, loadingGenerate }) {
  return (
    <ButtonGroup
      variant="contained"
      disableElevation
      sx={{ borderRadius: '40px', overflow: 'hidden' }}
    >
      <Button
        onClick={onCreate}
        disabled={loadingCreate}
        sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
      >
        {loadingCreate ? '...' : 'Create Recipe'}
      </Button>
      <Button
        onClick={onGenerate}
        disabled={loadingGenerate}
        sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      >
        {loadingGenerate ? '...' : 'Generate Recipe'}
      </Button>
    </ButtonGroup>
  );
}
