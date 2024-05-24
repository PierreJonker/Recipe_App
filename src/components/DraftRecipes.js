// src/components/DraftRecipes.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Container, Button } from 'react-bootstrap';

const DraftRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchDraftRecipes = async () => {
      if (user) {
        const q = query(collection(firestore, 'recipes'), where('createdBy', '==', user.uid), where('status', '==', 'draft'));
        const querySnapshot = await getDocs(q);
        const fetchedRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(fetchedRecipes);
      }
    };

    fetchDraftRecipes();
  }, [user, firestore]);

  const handleDelete = async (id) => {
    await deleteDoc(doc(firestore, 'recipes', id));
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  return (
    <Container>
      <h2>Your Draft Recipes</h2>
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
