
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCVfUR1zCLobC79JLKmCZuBhwm-16v4azM",
  authDomain: "webmessage-5e8db.firebaseapp.com",
  projectId: "webmessage-5e8db",
  storageBucket: "webmessage-5e8db.appspot.com",
  messagingSenderId: "708070229804",
  appId: "1:708070229804:web:851a6db8f613addc4a8e89",
  measurementId: "G-B3VZ8TDPTY",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
