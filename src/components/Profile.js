// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Form, Button, Container } from 'react-bootstrap';

const Profile = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const firestore = getFirestore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEmail(userData.email);
          setUsername(userData.username);
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, firestore]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        if (username !== user.displayName) {
          await updateProfile(user, { displayName: username });
          await updateDoc(doc(firestore, 'users', user.uid), { username });
        }
        if (email !== user.email) {
          await updateEmail(user, email);
          await updateDoc(doc(firestore, 'users', user.uid), { email });
        }
        if (newPassword) {
          await updatePassword(user, newPassword);
        }
        alert('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h2>Profile</h2>
      <Form onSubmit={handleUpdate}>
        <Form.Group controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formNewPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Update Profile
        </Button>
      </Form>
    </Container>
  );
};

export default Profile;
