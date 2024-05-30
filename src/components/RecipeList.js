// src/components/RecipeList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Container, Button } from 'react-bootstrap';

const RecipeList = ({ type }) => {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const firestore = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchRecipes = async () => {
      const user = auth.currentUser;
      let q;
      if (type === 'public') {
        q = query(collection(firestore, 'recipes'), where('status', '==', 'public'));
      } else if (type === 'private' && user) {
        q = query(collection(firestore, 'recipes'), where('createdBy', '==', user.uid), where('status', '==', 'private'));
      } else if (type === 'draft' && user) {
        q = query(collection(firestore, 'recipes'), where('createdBy', '==', user.uid), where('status', '==', 'draft'));
      } else {
        return;
      }

      const querySnapshot = await getDocs(q);
      const fetchedRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(fetchedRecipes);
    };

    fetchRecipes();
  }, [type, firestore, auth]);

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
      <h2>{type.charAt(0).toUpperCase() + type.slice(1)} Recipes</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {recipes.length === 0 ? (
        <p>No {type} recipes found.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/recipes/${recipe.id}`}>{recipe.title}</Link>
              {recipe.createdBy === auth.currentUser?.uid && (
                <Button variant="danger" onClick={() => handleDelete(recipe.id)}>Delete</Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default RecipeList;
