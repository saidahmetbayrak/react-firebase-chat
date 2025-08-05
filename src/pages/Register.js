import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const displayName = e.target.displayName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const file = e.target.file.files[0];

    try {
      // Create user in Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            // Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });

            // Create user document in Firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });

            // Create empty user chats collection
            await setDoc(doc(db, "userChats", res.user.uid), {});

            setLoading(false);
            navigate("/"); // Redirect to home page after successful registration
          } catch (err) {
            setError(err.message);
            setLoading(false);
          }
        });
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1>WebChat - Kaydol</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" name="displayName" placeholder="Görünen Ad" required />
          <input type="email" name="email" placeholder="E-posta" required />
          <input type="password" name="password" placeholder="Şifre" required />
          <input type="file" name="file" id="file" style={{ display: "none" }} />
          <label htmlFor="file">
            <img src="https://cdn-icons-png.flaticon.com/512/107/107097.png" alt="" width="30" height="30" />
            Profil resmi ekle
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Kaydolunuyor..." : "Kaydol"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <p>
          Zaten bir hesabınız var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;