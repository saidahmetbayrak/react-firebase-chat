import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Login = () => {
  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/")
    } catch (error) {
      setErr(true);
    }
  };

  return (
    <div className="form-container vh-100 d-flex align-items-center justify-content-center">
      <Card style={{ width: '25rem', padding: '2rem' }}>
        <Card.Body>
          <h1 className="text-center mb-4 fw-bold">Chat App</h1>
          <h5 className="text-center text-muted mb-4">Login</h5>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control type="email" placeholder="Email" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="password" placeholder="Password" required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Sign in
            </Button>
            {err && <Alert variant="danger" className="mt-3">Something went wrong</Alert>}
          </Form>
          <p className="mt-3 text-center">You don't have an account? <Link to="/register">Register</Link></p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;