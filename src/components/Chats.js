import React, { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { ListGroup, Image } from 'react-bootstrap';
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";

const Chats = () => {
  const [chats, setChats] = useState({});
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data() || {});
      });
      return () => unsub();
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <ListGroup variant="flush" className="flex-grow-1" style={{ overflowY: 'auto' }}>
      {Object.entries(chats)?.sort((a,b) => b[1].date - a[1].date).map((chat) => (
        <ListGroup.Item 
          key={chat[0]} 
          action 
          onClick={() => handleSelect(chat[1].userInfo)}
          className="d-flex align-items-center p-3"
        >
          <Image 
            src={chat[1].userInfo.photoURL} 
            roundedCircle 
            style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
          />
          <div className="w-100">
            <div className="d-flex justify-content-between">
              <h6 className="mb-1 fw-bold">{chat[1].userInfo.displayName}</h6>
              {/* <small>1 day ago</small> */}
            </div>
            <p className="mb-1 text-muted small">{chat[1].lastMessage?.text}</p>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default Chats;
