import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, rtdb } from "../firebase";
import { ref, set, onDisconnect } from "firebase/database";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Set user online status in Realtime Database
        const userStatusRef = ref(rtdb, 'users/' + user.uid + '/online');
        set(userStatusRef, true);

        // Set up onDisconnect to set status to false when user disconnects
        onDisconnect(userStatusRef).set(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};