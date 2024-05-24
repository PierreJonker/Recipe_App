// src/components/RecipeForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const RecipeForm = () => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const firestore = getFirestore();

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        const docRef = doc(firestore, 'recipes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const recipe = docSnap.data();
          setTitle(recipe.title);
          setIngredients(recipe.ingredients);
          setInstructions(recipe.instructions);
          setStatus(recipe.status);
        }
      };
      fetchRecipe();
    }
  }, [id, firestore]);

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredientField = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      navigate('/login');
      return;
    }

    const recipeData = {
      title,
      ingredients,
      instructions,
      status,
      createdBy: user.uid,
      createdAt: new Date()
    };

    try {
      if (id) {
        await setDoc(doc(firestore, 'recipes', id), recipeData);
      } else {
        await setDoc(doc(firestore, 'recipes', `${new Date().getTime()}-${user.uid}`), recipeData);
      }
      navigate(status === 'draft' ? '/draft-recipes' : '/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>{id ? 'Edit Recipe' : 'Add Recipe'}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>

        <Form.Label>Ingredients</Form.Label>
        {ingredients.map((ingredient, index) => (
          <Form.Group key={index} controlId={`formIngredient${index}`}>
            <Form.Control
              type="text"
              placeholder={`Ingredient ${index + 1}`}
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
            />
            <Button variant="danger" onClick={() => removeIngredientField(index)}>Remove</Button>
          </Form.Group>
        ))}
        <Button variant="secondary" onClick={addIngredientField}>Add Ingredient</Button>

        <Form.Group controlId="formInstructions">
          <Form.Label>Instructions</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formStatus">
          <Form.Label>Status</Form.Label>
          <Form.Control
            as="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {id ? 'Update' : 'Save'} Recipe
        </Button>
      </Form>
    </Container>
  );
};

export default RecipeForm;
