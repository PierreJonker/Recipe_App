import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('https://us-central1-recipesharingapp-1be92.cloudfunctions.net/api/forgotPassword', { email });
      setSecurityQuestion(response.data.securityQuestion);
      setStep(2);
    } catch (error) {
      setError('Error initiating password reset: ' + error.message);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    setError(null);

    if (!securityAnswer || !newPassword) {
      setError('All fields are required');
      return;
    }

    try {
      await axios.post('https://us-central1-recipesharingapp-1be92.cloudfunctions.net/api/resetPassword', { email, securityAnswer, newPassword });
      setStep(3);
    } catch (error) {
      setError('Error resetting password: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {step === 1 && (
        <Form onSubmit={handleSubmitEmail}>
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
      )}
      {step === 2 && (
        <Form onSubmit={handleSubmitAnswer}>
          <Form.Group controlId="formSecurityQuestion">
            <Form.Label>Security Question</Form.Label>
            <Form.Control
              type="text"
              value={securityQuestion}
              disabled
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
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">Submit</Button>
        </Form>
      )}
      {step === 3 && (
        <Alert variant="success">Password reset successfully!</Alert>
      )}
    </div>
  );
};

export default ForgotPassword;
