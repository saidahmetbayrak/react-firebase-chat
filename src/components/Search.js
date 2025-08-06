import React, { useState, useContext } from 'react';
import { Form, InputGroup, Button, Card, Alert, Image } from 'react-bootstrap';
import { collection, query, where, getDocs, serverTimestamp, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const Search = () => {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const handleSearch = async () => {
    if (!username) return;
    const q = query(
      collection(db, "users"),
      where("displayName", ">=", username),
      where("displayName", "<=", username + '')
    );
    try {
      const querySnapshot = await getDocs(q);
      const foundUsers = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().uid !== currentUser.uid) {
          foundUsers.push(doc.data());
        }
      });
      setUsers(foundUsers);
      if (foundUsers.length === 0) {
        setErr(true);
      } else {
        setErr(false);
      }
    } catch (error) {
      setErr(true);
      setUsers([]);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSelect = async (user) => {
    const combinedId = currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await setDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        }, { merge: true });

        await setDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {}

    setUsers([]);
    setUsername("");
    dispatch({ type: "CHANGE_USER", payload: user });
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
      
      {users.map(user => (
        <Card key={user.uid} onClick={() => handleSelect(user)} style={{ cursor: 'pointer', marginTop: '10px' }}>
          <Card.Body className="d-flex align-items-center">
            <Image src={user.photoURL || 'https://via.placeholder.com/50'} roundedCircle style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }} />
            <Card.Title className="mb-0">{user.displayName}</Card.Title>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default Search;