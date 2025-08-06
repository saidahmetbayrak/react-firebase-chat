import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import { ChatContext } from '../context/ChatContext';

const Home = () => {
  const { data } = useContext(ChatContext);

  // Check if a chat user is selected
  const isChatSelected = data.user && data.user.uid;

  return (
    <div className={`home ${isChatSelected ? 'chat-selected' : ''}`}>
      <div className="container">
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
};

export default Home;