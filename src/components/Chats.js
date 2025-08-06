import React, { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db, rtdb } from "../firebase";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data() || {});
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && currentUser.uid !== "" && getChats();
    console.log("Current User UID in Chats:", currentUser.uid); // Added console.log
  }, [currentUser.uid]);

  useEffect(() => {
    if (chats) {
      Object.entries(chats).forEach(([chatId, chat]) => {
        if (chat.userInfo && chat.userInfo.uid) { // Add this check
          const userUid = chat.userInfo.uid;
          const userStatusRef = ref(rtdb, 'users/' + userUid + '/online');
          onValue(userStatusRef, (snapshot) => {
            setOnlineUsers((prev) => ({
              ...prev,
              [userUid]: snapshot.val(),
            }));
          });
        }
      });
    }
  }, [chats]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className="chats">
      {Object.entries(chats)?.sort((a,b)=>b[1].date?.toDate() - a[1].date?.toDate()).map((chat) => (
        <div
          className="userChat"
          key={chat[0]}
          onClick={() => handleSelect(chat[1].userInfo)}
        >
          {chat[1].userInfo && (
            <img src={chat[1].userInfo.photoURL || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="" />
          )}
          <div className="userChatInfo">
            {chat[1].userInfo && <span>{chat[1].userInfo.displayName}</span>}
            {onlineUsers[chat[1].userInfo?.uid] ? (
              <span className="online-dot"></span>
            ) : (
              <span className="offline-dot"></span>
            )}
            <p>{chat[1].lastMessage?.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;