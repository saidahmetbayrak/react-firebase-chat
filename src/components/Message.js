import React, { useContext, useRef, useEffect } from 'react';
import { Image } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const isOwner = message.senderId === currentUser.uid;
  const sender = isOwner ? currentUser : data.user;

  const messageDate = message.date?.toDate();
  const timeString = messageDate ? messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div ref={ref} className={`d-flex mb-3 ${isOwner ? 'justify-content-end' : ''}`}>
      <div className={`d-flex align-items-end ${isOwner ? 'flex-row-reverse' : ''}`}>
        <Image 
          src={sender.photoURL} 
          roundedCircle 
          style={{ 
            width: '40px', 
            height: '40px', 
            objectFit: 'cover', 
            margin: isOwner ? '0 0 0 10px' : '0 10px 0 0' 
          }} 
        />
        <div 
          className={`p-3 rounded-3 ${isOwner ? 'bg-primary text-white' : 'bg-white'}`}
          style={{ maxWidth: '400px', boxShadow: '0 1px 1px rgba(0,0,0,0.05)' }}
        >
          {message.text && <p className="mb-0">{message.text}</p>}
          {message.img && <Image src={message.img} fluid rounded className="mt-2" />}
          <small className={`d-block text-end mt-2 ${isOwner ? 'text-light' : 'text-muted'}`}>
            {timeString}
          </small>
        </div>
      </div>
    </div>
  );
};

export default Message;
