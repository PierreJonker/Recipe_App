// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbReYlG5kUcEqqq8gA0CCI8K6MMM-i2c4",
  authDomain: "recipesharingapp-1be92.firebaseapp.com",
  projectId: "recipesharingapp-1be92",
  storageBucket: "recipesharingapp-1be92.appspot.com",
  messagingSenderId: "845539011706",
  appId: "1:845539011706:web:fd350d29389026d9a95fc3",
  measurementId: "G-9T99KRPWDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
