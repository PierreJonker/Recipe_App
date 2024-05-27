// src/components/Home.js
import React from 'react';
import { Container } from 'react-bootstrap';

const Home = () => {
  return (
    <Container>
      <h2>Welcome to RecipeApp</h2>
      <p>This application is designed to help you share and manage your favorite recipes. You can create, edit, and share your recipes with the public or keep them private. You can also save drafts to work on them later.</p>
      <p>Developed by Pierre Jonker.</p>
      <h3>How it works:</h3>
      <ul>
        <li><strong>Register/Login:</strong> Create an account or log in to your existing account to access the app features.</li>
        <li><strong>Create Recipes:</strong> Add new recipes and choose to keep them private, public, or save them as drafts.</li>
        <li><strong>Edit Recipes:</strong> Edit your existing recipes. Only the creator can edit a recipe.</li>
        <li><strong>Manage Recipes:</strong> View and manage your private, public, and draft recipes from their respective sections.</li>
      </ul>
    </Container>
  );
};

export default Home;
