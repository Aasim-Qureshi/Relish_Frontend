import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from '../../application/auth/pages/SignupPage';
import LoginPage from '../../application/auth/pages/LoginPage';
import RecipeDashboard from '../../application/recipes/pages/RecipeDashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<SignupPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='dashboard' element={<RecipeDashboard/>} />
      </Routes>
    </BrowserRouter>
  );
}
