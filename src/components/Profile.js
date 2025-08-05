
import React, { useContext, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(currentUser.displayName || "");
  const [photo, setPhoto] = useState(null);
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
      let photoURL = currentUser.photoURL;

      if (photo) {
        const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, photo);

        await uploadTask;
        photoURL = await getDownloadURL(storageRef);
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName,
        photoURL: photoURL,
      });

      // Update Firestore user document
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName,
        photoURL: photoURL,
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
              src={currentUser.photoURL || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
              alt="Profil Resmi"
              className="profile-avatar"
            />
            <input
              type="file"
              id="photo-upload"
              style={{ display: "none" }}
              onChange={(e) => setPhoto(e.target.files[0])}
            />
            <label htmlFor="photo-upload" className="upload-button">
              Resim Değiştir
            </label>
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
