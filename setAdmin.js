const admin = require('firebase-admin');
const serviceAccount = require('./src/serviceAccountKey.json'); // Adjust the path as necessary

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

const setAdminRole = async (uid) => {
  const userRef = firestore.collection('users').doc(uid);
  await userRef.set({ admin: true }, { merge: true });
  console.log(`User ${uid} is now an admin.`);
};

const uid = 'cW7Ugxe1QCTkEjJ8G7lmZqKkt5m1'; // Replace with the UID of the user you want to make an admin
setAdminRole(uid).catch(console.error);
