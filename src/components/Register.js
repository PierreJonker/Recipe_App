// src/components/Register.js
import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { app } from '../firebase';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        username: username,
        createdAt: new Date(),
        admin: false, // default value
        securityQuestion: question,
        securityAnswer: answer,
      });
      setSuccess('Your account was created!');
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError('Error registering. Please try again.');
      setSuccess('');
    }
  };

  return (
    <Container>
      <h2>Register</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleRegister}>
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formSecurityQuestion">
          <Form.Label>Security Question</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter a security question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formSecurityAnswer">
          <Form.Label>Security Answer</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter the answer to your security question"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    </Container>
  );
}

export default Register;
