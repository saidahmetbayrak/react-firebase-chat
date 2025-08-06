import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Register = () => {
  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const storageRef = ref(storage, `users/${res.user.uid}/${displayName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error("Upload error:", error);
          setErr(true);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          });
        }
      );
    } catch (error) {
      setErr(true);
    }
  };

  return (
    <div className="form-container vh-100 d-flex align-items-center justify-content-center">
      <Card style={{ width: '25rem', padding: '2rem' }}>
        <Card.Body>
          <h1 className="text-center mb-4 fw-bold">Chat App</h1>
          <h5 className="text-center text-muted mb-4">Register</h5>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control type="text" placeholder="Display Name" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="email" placeholder="Email" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="password" placeholder="Password" required />
            </Form.Group>
            
            <Button variant="primary" type="submit" className="w-100">
              Sign up
            </Button>
            {err && <Alert variant="danger" className="mt-3">Something went wrong</Alert>}
          </Form>
          <p className="mt-3 text-center">You do have an account? <Link to="/login">Login</Link></p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
