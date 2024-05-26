const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));

// Example endpoint to check security question
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

// Example endpoint to reset password
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

// Other endpoints...

exports.api = functions.https.onRequest(app);
