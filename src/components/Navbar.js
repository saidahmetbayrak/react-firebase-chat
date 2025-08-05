
import React, { useContext } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { Link } from "react-router-dom";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className='navbar'>
      <span className="logo">WebChat</span>
      <div className="user">
        <img src={currentUser.photoURL} alt="" />
        <span>{currentUser.displayName}</span>
        <Link to="/profile"><button>Profil</button></Link>
        <button onClick={() => signOut(auth)}>Çıkış Yap</button>
      </div>
    </div>
  );
};

export default Navbar;
