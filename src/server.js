const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Initialize the app with a service account, granting admin privileges
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://recipesharingapp-1be92.firebaseio.com' // Update with your database URL
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Endpoint to check security question
app.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;
  const firestore = admin.firestore();

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    const userSnapshot = await firestore.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(404).send('User not found');
    }

    const userDoc = userSnapshot.docs[0];
    const securityQuestion = userDoc.data().securityQuestion;
    res.status(200).send({ securityQuestion });
  } catch (error) {
    console.error('Error initiating forgot password:', error);
    res.status(400).send('Error initiating forgot password: ' + error.message);
  }
});

// Endpoint to reset password
app.post('/resetPassword', async (req, res) => {
  const { email, securityAnswer, newPassword } = req.body;
  const firestore = admin.firestore();

  if (!email || !securityAnswer || !newPassword) {
    return res.status(400).send('All fields are required');
  }

  try {
    const userSnapshot = await firestore.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(404).send('User not found');
    }

    const userDoc = userSnapshot.docs[0];
    if (userDoc.data().securityAnswer !== securityAnswer) {
      return res.status(400).send('Incorrect security answer');
    }

    const userId = userDoc.id;
    await admin.auth().updateUser(userId, { password: newPassword });
    res.status(200).send('Password reset successfully');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).send('Error resetting password: ' + error.message);
  }
});

// Endpoint to create a support ticket
app.post('/supportTicket', async (req, res) => {
  const { email, subject, message, issueType } = req.body;
  const firestore = admin.firestore();

  if (!email || !subject || !message || !issueType) {
    return res.status(400).send('Invalid request: All fields are required');
  }

  try {
    const id = uuidv4();
    await firestore.collection('supportTickets').doc(id).set({
      email,
      subject,
      message,
      issueType,
      createdAt: new Date().toISOString(),
      replies: [],
      uniqueIdentifier: id,
    });
    res.status(201).send({ id });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(400).send('Error creating support ticket: ' + error.message);
  }
});

// Endpoint to get a support ticket by unique identifier
app.get('/supportTicket/:id', async (req, res) => {
  const { id } = req.params;
  const firestore = admin.firestore();

  try {
    const doc = await firestore.collection('supportTickets').doc(id).get();
    if (doc.exists) {
      res.status(200).send(doc.data());
    } else {
      res.status(404).send('Support ticket not found');
    }
  } catch (error) {
    console.error('Error retrieving support ticket:', error);
    res.status(400).send('Error retrieving support ticket: ' + error.message);
  }
});

// Endpoint to respond to a support ticket
app.post('/supportTicket/:id/respond', async (req, res) => {
  const { id } = req.params;
  const { reply, isAdmin } = req.body; // isAdmin will indicate if the reply is from an admin
  const firestore = admin.firestore();

  if (!reply) {
    return res.status(400).send('Invalid request: Reply is required');
  }

  try {
    const ticketRef = firestore.collection('supportTickets').doc(id);
    const user = isAdmin ? await admin.auth().getUser(req.body.uid) : null; // Assuming uid is sent with the request if isAdmin is true
    await ticketRef.update({
      replies: admin.firestore.FieldValue.arrayUnion({
        reply,
        role: isAdmin ? `Admin (${user.displayName})` : 'User',
        timestamp: new Date().toISOString()
      })
    });
    res.status(200).send('Reply added successfully');
  } catch (error) {
    console.error('Error adding reply to support ticket:', error);
    res.status(400).send('Error adding reply to support ticket: ' + error.message);
  }
});

// Endpoint to delete a support ticket
app.delete('/supportTicket/:id', async (req, res) => {
  const { id } = req.params;
  const firestore = admin.firestore();

  try {
    await firestore.collection('supportTickets').doc(id).delete();
    res.status(200).send('Support ticket deleted successfully');
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(400).send('Error deleting support ticket: ' + error.message);
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
