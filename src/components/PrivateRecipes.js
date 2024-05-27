// src/components/PrivateRecipes.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Container, Button, Form } from 'react-bootstrap';

const PrivateRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchPrivateRecipes = async () => {
      if (user) {
        const q = query(collection(firestore, 'recipes'), where('createdBy', '==', user.uid), where('status', '==', 'private'));
        const querySnapshot = await getDocs(q);
        const fetchedRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(fetchedRecipes);
      }
    };

    fetchPrivateRecipes();
  }, [user, firestore]);

  const handleDelete = async (id) => {
    await deleteDoc(doc(firestore, 'recipes', id));
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  const handleChangeStatus = async (id, newStatus) => {
    await updateDoc(doc(firestore, 'recipes', id), { status: newStatus });
    setRecipes(recipes.map(recipe => recipe.id === id ? { ...recipe, status: newStatus } : recipe));
  };

  return (
    <Container>
      <h2>Your Private Recipes</h2>
      {recipes.length === 0 ? (
        <p>No private recipes found.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/edit-recipe/${recipe.id}`}>{recipe.title}</Link>
              <Button variant="danger" onClick={() => handleDelete(recipe.id)}>Delete</Button>
              <Form.Select 
                value={recipe.status} 
                onChange={(e) => handleChangeStatus(recipe.id, e.target.value)}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </Form.Select>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default PrivateRecipes;
