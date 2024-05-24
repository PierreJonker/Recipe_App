import React, { useState } from 'react';
import { Form, Button, Table, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';

const Support = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [issueType, setIssueType] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !subject || !message || !issueType) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/supportTicket', {
        email,
        subject,
        message,
        issueType
      });
      setTicketId(response.data.id);
      setEmail('');
      setSubject('');
      setMessage('');
      setIssueType('');
    } catch (error) {
      setError('Error creating support ticket: ' + error.message);
    }
  };

  const handleFetchTickets = async () => {
    setError(null);

    if (!ticketId) {
      setError('Ticket ID is required');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/supportTicket/${ticketId}`);
      setTickets([response.data]);
    } catch (error) {
      setError('Error fetching support ticket: ' + error.message);
    }
  };

  const handleViewTicket = (ticket) => {
    setCurrentTicket(ticket);
    setShowModal(true);
  };

  const handleReply = async () => {
    try {
      const isAdmin = false; // Change this condition based on your logic to determine if the reply is from an admin
      await axios.post(`http://localhost:5000/supportTicket/${currentTicket.uniqueIdentifier}/respond`, { reply, isAdmin });
      const updatedTickets = tickets.map(ticket =>
        ticket.uniqueIdentifier === currentTicket.uniqueIdentifier ? { ...ticket, replies: [...(ticket.replies || []), { reply, role: isAdmin ? 'Admin' : 'User', timestamp: new Date().toISOString() }] } : ticket
      );
      setTickets(updatedTickets);
      setReply('');
      setShowModal(false);
    } catch (error) {
      setError('Error sending reply: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Create Support Ticket</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {ticketId && <Alert variant="success">Support ticket created with ID: {ticketId}</Alert>}
      <Form onSubmit={handleCreateTicket}>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formIssueType">
          <Form.Label>Issue Type</Form.Label>
          <Form.Control
            as="select"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            <option value="">Select issue type</option>
            <option value="login">Login Issue</option>
            <option value="signup">Signup Issue</option>
            <option value="other">Other</option>
          </Form.Control>
        </Form.Group>
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

      <h2>View Support Ticket</h2>
      <Form.Group controlId="formTicketId">
        <Form.Label>Ticket ID</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter your ticket ID"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" onClick={handleFetchTickets}>Fetch Ticket</Button>

      <h3>Your Tickets</h3>
      {tickets.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Replies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.uniqueIdentifier}>
                <td>{ticket.email}</td>
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
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Support Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTicket && (
            <>
              <p><strong>Email:</strong> {currentTicket.email}</p>
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

export default Support;
