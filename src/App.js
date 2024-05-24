// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import RecipeDetail from './components/RecipeDetail';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PrivateRecipes from './components/PrivateRecipes';
import DraftRecipes from './components/DraftRecipes';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import Admin from './components/Admin';
import Support from './components/Support';
import ForgotPassword from './components/ForgotPassword';
import Footer from './components/Footer';
import { Container } from 'react-bootstrap';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Container className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/support" element={<Support />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/recipes" element={<PrivateRoute><RecipeList type="public" /></PrivateRoute>} />
          <Route path="/recipes/:id" element={<PrivateRoute><RecipeDetail /></PrivateRoute>} />
          <Route path="/add-recipe" element={<PrivateRoute><RecipeForm /></PrivateRoute>} />
          <Route path="/edit-recipe/:id" element={<PrivateRoute><RecipeForm /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/private-recipes" element={<PrivateRoute><PrivateRecipes /></PrivateRoute>} />
          <Route path="/draft-recipes" element={<PrivateRoute><DraftRecipes /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute requiresAdmin={true}><Admin /></PrivateRoute>} />
        </Routes>
      </Container>
      <Footer />
    </Router>
  );
}

export default App;
