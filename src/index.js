import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithAuth from './App';
import './styles/main.css'; // Import the CSS file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithAuth />
  </React.StrictMode>
);