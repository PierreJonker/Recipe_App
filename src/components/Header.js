import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const firestore = getFirestore();

    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    await auth.signOut();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">RecipeApp</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/support">Support</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/recipes">Recipes</Nav.Link>
                <Nav.Link as={Link} to="/add-recipe">Add Recipe</Nav.Link>
                <Nav.Link as={Link} to="/private-recipes">Private Recipes</Nav.Link>
                <Nav.Link as={Link} to="/draft-recipes">Draft Recipes</Nav.Link>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                {isAdmin && <Nav.Link as={Link} to="/admin">Admin</Nav.Link>}
                <Nav.Link as={Link} to="/" onClick={handleLogout}>Logout</Nav.Link>
              </>
            )}
            {!user && (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
