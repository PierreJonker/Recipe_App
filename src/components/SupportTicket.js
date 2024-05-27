import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Alert, Modal } from 'react-bootstrap';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const SupportTicket = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [reply, setReply] = useState('');

  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    const fetchTickets = async () => {
      const user = auth.currentUser;
      if (user) {
        const ticketsSnapshot = await getDocs(collection(firestore, `users/${user.uid}/supportTickets`));
        const ticketsList = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(ticketsList);
      }
    };

    fetchTickets();
  }, [auth, firestore]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      setError('User not logged in');
      return;
    }

    if (!subject || !message) {
      setError('All fields are required');
      return;
    }

    try {
      await addDoc(collection(firestore, `users/${user.uid}/supportTickets`), {
        subject,
        message,
        createdAt: new Date().toISOString(),
        replies: []
      });
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (error) {
      setError('Error creating support ticket: ' + error.message);
    }
  };

  const handleViewTicket = (ticket) => {
    setCurrentTicket(ticket);
    setShowModal(true);
  };

  const handleReply = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('User not logged in');
      return;
    }

    try {
      await updateDoc(doc(firestore, `users/${user.uid}/supportTickets`, currentTicket.id), {
        replies: [...currentTicket.replies, { reply, role: 'User', timestamp: new Date().toISOString() }]
      });
      setReply('');
      setShowModal(false);
      fetchTickets();
    } catch (error) {
      setError('Error sending reply: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Support Tickets</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleCreateTicket}>
        <Form.Group controlId="formSubject">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formMessage">
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">Submit</Button>
      </Form>
      <h3>Your Tickets</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Message</th>
            <th>Replies</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.subject}</td>
              <td>{ticket.message}</td>
              <td>
                {ticket.replies && ticket.replies.map((reply, index) => (
                  <div key={index}>
                    <strong>{reply.role} ({new Date(reply.timestamp).toLocaleString()}):</strong> {reply.reply}
                  </div>
                ))}
              </td>
              <td>
                <Button variant="primary" onClick={() => handleViewTicket(ticket)}>View</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Support Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTicket && (
            <>
              <p><strong>Subject:</strong> {currentTicket.subject}</p>
              <p><strong>Message:</strong> {currentTicket.message}</p>
              {currentTicket.replies && currentTicket.replies.map((reply, index) => (
                <div key={index}>
                  <strong>{reply.role} ({new Date(reply.timestamp).toLocaleString()}):</strong> {reply.reply}
                </div>
              ))}
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SupportTicket;
