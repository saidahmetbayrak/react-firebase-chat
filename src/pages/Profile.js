
import React, { useContext, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(currentUser.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName,
      });

      // Update Firestore user document
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName,
      });

      setSuccess("Profil başarıyla güncellendi!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <h1>Profil Ayarları</h1>
        <button onClick={() => navigate(-1)} className="back-button">Geri</button>
        <form onSubmit={handleUpdate}>
          <div className="profile-image-upload">
            <img
              src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
              alt="Profil Resmi"
              className="profile-avatar"
            />
          </div>
          <input
            type="text"
            placeholder="Görünen Ad"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Güncelleniyor..." : "Profili Güncelle"}
          </button>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default Profile;
