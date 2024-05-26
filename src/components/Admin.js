import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { getFirestore, collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const firestore = getFirestore();
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        const recipesSnapshot = await getDocs(collection(firestore, 'recipes'));
        const supportTicketsSnapshot = await getDocs(collection(firestore, 'supportTickets'));

        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const recipesList = recipesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const supportTicketsList = supportTicketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setUsers(usersList);
        setRecipes(recipesList);
        setSupportTickets(supportTicketsList);
      } catch (error) {
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const firestore = getFirestore();
      await deleteDoc(doc(firestore, 'recipes', recipeId));
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      setError('Failed to delete recipe');
    }
  };

  const handleResetPassword = async (userId) => {
    const firestore = getFirestore();
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        const securityQuestion = userDoc.data().securityQuestion;
        const userAnswer = prompt(`Please answer the security question: ${securityQuestion}`);
        if (userAnswer === userDoc.data().securityAnswer) {
          let newPassword = '';
          do {
            newPassword = prompt('Enter the new password (at least 6 characters):');
          } while (newPassword.length < 6);

          const response = await axios.post('http://localhost:5000/resetPassword', {
            uid: userId,
            newPassword: newPassword,
          });
          if (response.status === 200) {
            alert('Password reset successfully!');
          } else {
            console.error('Error resetting password:', response.data);
            alert('Error resetting password.');
          }
        } else {
          alert('Incorrect answer to the security question.');
        }
      } else {
        alert('User not found.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password.');
    }
  };

  const handleViewUser = async (userId) => {
    const firestore = getFirestore();
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (userDoc.exists()) {
      setCurrentUser(userDoc.data());
      setShowUserModal(true);
    }
  };

  const handleViewTicket = (ticket) => {
    setCurrentTicket(ticket);
    setShowTicketModal(true);
  };

  const handleReply = async () => {
    if (currentTicket && reply) {
      const response = await axios.post(`http://localhost:5000/supportTicket/${currentTicket.id}/respond`, { reply });
      if (response.status === 200) {
        const updatedTickets = supportTickets.map(ticket =>
          ticket.id === currentTicket.id ? { ...ticket, reply } : ticket
        );
        setSupportTickets(updatedTickets);
        setReply('');
        setShowTicketModal(false);
        alert('Reply sent successfully');
      } else {
        alert('Error sending reply');
      }
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/supportTicket/${ticketId}`);
      if (response.status === 200) {
        setSupportTickets(supportTickets.filter(ticket => ticket.id !== ticketId));
        alert('Support ticket deleted successfully');
      } else {
        console.error('Error deleting support ticket:', response.data);
        alert('Error deleting support ticket');
      }
    } catch (error) {
      console.error('Error deleting support ticket:', error);
      alert('Error deleting support ticket');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <h3>Manage Users</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>
                <Button variant="link" onClick={() => handleViewUser(user.id)}>{user.email}</Button>
              </td>
              <td>{user.admin ? 'Yes' : 'No'}</td>
              <td>
                <Button variant="warning" onClick={() => handleResetPassword(user.id)}>Reset Password</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Manage Recipes</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Created By</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map(recipe => (
            <tr key={recipe.id}>
              <td>{recipe.title}</td>
              <td>{recipe.createdBy}</td>
              <td>{recipe.status}</td>
              <td>
                <Button variant="danger" onClick={() => handleDeleteRecipe(recipe.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Support Tickets</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Email</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {supportTickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.email}</td>
              <td>{ticket.subject}</td>
              <td>{ticket.message}</td>
              <td>
                <Button variant="primary" onClick={() => handleViewTicket(ticket)}>View</Button>
                <Button variant="danger" onClick={() => handleDeleteTicket(ticket.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>User Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <>
              <p><strong>Username:</strong> {currentUser.username}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Security Question:</strong> {currentUser.securityQuestion}</p>
              <p><strong>Security Answer:</strong> {currentUser.securityAnswer}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Support Ticket Modal */}
      <Modal show={showTicketModal} onHide={() => setShowTicketModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Support Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTicket && (
            <>
              <p><strong>Email:</strong> {currentTicket.email}</p>
              <p><strong>Subject:</strong> {currentTicket.subject}</p>
              <p><strong>Message:</strong> {currentTicket.message}</p>
              {currentTicket.reply && (
                <>
                  <p><strong>Admin Reply:</strong> {currentTicket.reply}</p>
                </>
              )}
              <Form.Group controlId="formReply">
                <Form.Label>Reply</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter your reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleReply}>Send Reply</Button>
          <Button variant="secondary" onClick={() => setShowTicketModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Admin;
