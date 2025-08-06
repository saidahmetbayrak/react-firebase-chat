import React from 'react';
import Navbar from './Navbar';
import Search from './Search';
import Chats from './Chats';

const Sidebar = () => {
  return (
    <div className="sidebar d-flex flex-column h-100">
      <Navbar />
      <Search />
      <Chats />
    </div>
  );
};

export default Sidebar;
