// src/components/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { app } from '../firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const PrivateRoute = ({ children, requiresAdmin = false }) => {
  const auth = getAuth(app);
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const firestore = getFirestore(app);
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.admin || false);
        }
      }
      setCheckingAdmin(false);
    };
    checkAdmin();
  }, [user]);

  if (loading || checkingAdmin) {
    console.log('Loading or checking admin...');
    return <div>Loading...</div>;
  }

  if (error) {
    console.log('Error:', error.message);
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/Recipe_App/login" />;
  }

  if (requiresAdmin && !isAdmin) {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/Recipe_App/" />;
  }

  console.log('User authenticated and authorized');
  return children;
};

export default PrivateRoute;
