import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/forgotPassword', { email });
      setSecurityQuestion(response.data.securityQuestion);
    } catch (error) {
      setError('Error initiating password reset: ' + error.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError(null);

    if (!securityAnswer || !newPassword) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/resetPassword', {
        email,
        securityAnswer,
        newPassword
      });
      if (response.status === 200) {
        setSuccess(true);
        navigate('/login'); // Redirect to login page after successful password reset
      }
    } catch (error) {
      setError('Error resetting password: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Password reset successfully</Alert>}
      {!securityQuestion ? (
        <Form onSubmit={handleEmailSubmit}>
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
      ) : (
        <Form onSubmit={handlePasswordReset}>
          <Form.Group controlId="formSecurityQuestion">
            <Form.Label>Security Question</Form.Label>
            <Form.Control
              type="text"
              value={securityQuestion}
              readOnly
            />
          </Form.Group>
          <Form.Group controlId="formSecurityAnswer">
            <Form.Label>Security Answer</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formNewPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">Reset Password</Button>
        </Form>
      )}
    </div>
  );
};

export default ForgotPassword;
