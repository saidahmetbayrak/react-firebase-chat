import React, { useContext, useState, useEffect, useRef } from 'react';
import { Container, Row, Col, InputGroup, FormControl, Button, Image } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { db, storage } from "../firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, Timestamp, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";
import Message from './Message';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  
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
    if (text.trim() === "" && !img) return;

    let downloadURL = null;
    if (img) {
      const storageRef = ref(storage, uuid());
      const uploadTask = await uploadBytesResumable(storageRef, img);
      downloadURL = await getDownloadURL(uploadTask.ref);
    }

    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion({
        id: uuid(),
        text,
        senderId: currentUser.uid,
        date: Timestamp.now(),
        ...(downloadURL && { img: downloadURL }),
      }),
    });

    const lastMessage = text || "Image sent";
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: { text: lastMessage },
      [data.chatId + ".date"]: serverTimestamp(),
    });
    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: { text: lastMessage },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setText("");
    setImg(null);
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
        <Image src={data.user.photoURL} roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '15px' }} />
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
          <input type="file" id="file" style={{display:"none"}} onChange={e=>setImg(e.target.files[0])} />
          <label htmlFor="file" className='btn btn-light'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16"><path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/></svg>
          </label>
          <Button variant="primary" onClick={handleSend}>Send</Button>
        </InputGroup>
      </div>
    </div>
  );
};

export default Chat;