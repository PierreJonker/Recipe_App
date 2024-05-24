// src/components/RecipeList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Container } from 'react-bootstrap';

const RecipeList = ({ type }) => {
  const [recipes, setRecipes] = useState([]);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchRecipes = async () => {
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
  }, [type, firestore, user]);

  return (
    <Container>
      <h2>{type.charAt(0).toUpperCase() + type.slice(1)} Recipes</h2>
      {recipes.length === 0 ? (
        <p>No {type} recipes found.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/recipes/${recipe.id}`}>{recipe.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default RecipeList;
