import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const serverUrl = process.env.REACT_APP_SERVER_URL || '/api';

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      const response = await axios.post(`${serverUrl}/forgotPassword`, { email });
      if (response.status === 200) {
        setSuccess('Password reset link sent to your email');
      } else {
        setError('Error sending password reset link');
      }
    } catch (error) {
      setError('Error sending password reset link: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleForgotPassword}>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">Submit</Button>
      </Form>
    </div>
  );
};

export default ForgotPassword;
