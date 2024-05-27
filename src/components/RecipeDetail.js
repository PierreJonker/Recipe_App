// src/components/RecipeDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Container, Button } from 'react-bootstrap';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchRecipe = async () => {
      const recipeDoc = await getDoc(doc(firestore, 'recipes', id));
      if (recipeDoc.exists()) {
        setRecipe(recipeDoc.data());
      }
      setLoading(false);
    };

    fetchRecipe();
  }, [id, firestore]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!recipe) {
    return <p>Recipe not found.</p>;
  }

  return (
    <Container>
      <h2>{recipe.title}</h2>
      <h3>Ingredients:</h3>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
      <h3>Instructions:</h3>
      <p>{recipe.instructions}</p>
      {user && user.uid === recipe.createdBy && (
        <div>
          <Link to={`/edit-recipe/${id}`}>
            <Button variant="primary">Edit Recipe</Button>
          </Link>
        </div>
      )}
    </Container>
  );
};

export default RecipeDetail;
