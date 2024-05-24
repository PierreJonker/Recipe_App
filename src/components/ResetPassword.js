import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !securityAnswer || !newPassword) {
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
      }
    } catch (error) {
      setError('Error resetting password: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Password reset successfully</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formSecurityAnswer">
          <Form.Label>Security Answer</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your security answer"
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
        <Button variant="primary" type="submit">Submit</Button>
      </Form>
    </div>
  );
};

export default ResetPassword;
