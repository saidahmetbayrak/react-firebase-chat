import React, { useContext } from 'react';
import { Navbar, Nav, Image, Button } from 'react-bootstrap';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AuthContext } from '../context/AuthContext';

const CustomNavbar = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <Navbar bg="light" expand="lg" className="px-3" style={{ borderBottom: '1px solid #e0e0e0' }}>
      <Navbar.Brand href="#home" className="fw-bold">Chat App</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Nav className="align-items-center">
          <Image 
            src={currentUser.photoURL} 
            roundedCircle 
            style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} 
          />
          <Nav.Item className="fw-semibold me-3">{currentUser.displayName}</Nav.Item>
          <Button variant="outline-secondary" size="sm" onClick={() => signOut(auth)}>
            Logout
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNavbar;