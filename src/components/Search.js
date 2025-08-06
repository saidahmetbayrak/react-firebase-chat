import React, { useState, useContext } from 'react';
import { Form, InputGroup, Button, Card, Alert, Image } from 'react-bootstrap';
import { collection, query, where, getDocs, serverTimestamp, setDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from '../context/AuthContext';

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const handleSearch = async () => {
    if (!username) return;
    const q = query(collection(db, "users"), where("displayName", "==", username));
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setErr(true);
        setUser(null);
      } else {
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
          setErr(false);
        });
      }
    } catch (error) {
      setErr(true);
      setUser(null);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => {
    const combinedId = currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (error) {}

    setUser(null);
    setUsername("");
  };

  return (
    <div className="search-form p-3">
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Find a user"
          aria-label="Find a user"
          onKeyDown={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <Button variant="outline-secondary" onClick={handleSearch}>
          Search
        </Button>
      </InputGroup>

      {err && <Alert variant="danger" className="mt-2">User not found!</Alert>}
      
      {user && (
        <Card onClick={handleSelect} style={{ cursor: 'pointer' }}>
          <Card.Body className="d-flex align-items-center">
            <Image src={user.photoURL} roundedCircle style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }} />
            <Card.Title className="mb-0">{user.displayName}</Card.Title>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Search;