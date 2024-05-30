// src/components/DraftRecipes.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Container, Button } from 'react-bootstrap';

const DraftRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchDraftRecipes = async () => {
      if (user) {
        try {
          const q = query(collection(firestore, 'recipes'), where('createdBy', '==', user.uid), where('status', '==', 'draft'));
          const querySnapshot = await getDocs(q);
          const fetchedRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRecipes(fetchedRecipes);
        } catch (error) {
          setError('Failed to fetch draft recipes');
        }
      }
    };

    fetchDraftRecipes();
  }, [user, firestore]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'recipes', id));
      setRecipes(recipes.filter(recipe => recipe.id !== id));
    } catch (error) {
      setError('Failed to delete recipe');
    }
  };

  return (
    <Container>
      <h2>Your Draft Recipes</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {recipes.length === 0 ? (
        <p>No draft recipes found.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/edit-recipe/${recipe.id}`}>{recipe.title}</Link>
              <Button variant="danger" onClick={() => handleDelete(recipe.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default DraftRecipes;
