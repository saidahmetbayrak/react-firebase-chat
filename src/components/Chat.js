import React, { useContext, useState, useEffect, useRef } from 'react';
import { InputGroup, FormControl, Button, Image } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, Timestamp, serverTimestamp } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import Message from './Message';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  
  const { data, dispatch } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (data.chatId) {
      const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
        doc.exists() && setMessages(doc.data().messages);
      });
      return () => unSub();
    }
  }, [data.chatId]);

  const handleSend = async () => {
    if (text.trim() === "") return;

    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion({
        id: uuid(),
        text,
        senderId: currentUser.uid,
        date: Timestamp.now(),
        
      }),
    });

    const lastMessage = text;
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: { text: lastMessage },
      [data.chatId + ".date"]: serverTimestamp(),
    });
    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: { text: lastMessage },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setText("");
    
  };

  const handleBack = () => {
    dispatch({ type: "RESET_CHAT" });
  };

  if (!data.chatId) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light">
        <div className="text-center text-muted">
          <h4>Select a chat to start messaging</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="chat d-flex flex-column h-100">
      {/* Chat Header */}
      <div className="chat-header p-3 d-flex align-items-center" style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
        <Button variant="light" className="d-md-none me-2" onClick={handleBack}>
          <ArrowLeft />
        </Button>
        <Image src={data.user.photoURL || ''} roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '15px' }} />
        <h5 className="mb-0 fw-bold">{data.user.displayName}</h5>
      </div>

      {/* Messages Area */}
      <div className="messages flex-grow-1 p-3" style={{ overflowY: 'auto', backgroundColor: '#e9ebee' }}>
        {messages.map(m => <Message message={m} key={m.id} />)}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="message-input p-3 bg-light" style={{ borderTop: '1px solid #e0e0e0' }}>
        <InputGroup>
          <FormControl 
            placeholder="Type something..." 
            value={text} 
            onChange={e => setText(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          
          <Button variant="primary" onClick={handleSend}>Send</Button>
        </InputGroup>
      </div>
    </div>
  );
};

export default Chat;