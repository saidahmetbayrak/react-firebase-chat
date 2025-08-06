
import React, { useContext, useEffect, useState, useRef } from 'react';
import { ChatContext } from '../context/ChatContext';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import Message from "./Message";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const { data, dispatch } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const getMessages = () => {
      if (data.chatId) {
        const unSub = onSnapshot(doc(db, "chats", data.chatId), (snapshot) => {
          if (snapshot.exists()) {
            const newMessages = snapshot.data().messages;
            setMessages(newMessages);

            if (newMessages.length > messages.length && newMessages[newMessages.length - 1].senderId !== currentUser.uid) {
              const lastMessage = newMessages[newMessages.length - 1];
              if (Notification.permission === "granted") {
                new Notification(`Yeni Mesaj: ${data.user?.displayName}`,
                  {
                    body: lastMessage.text || "Resim gönderildi",
                    icon: data.user?.photoURL || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
                  }
                );
              }
            }
          }
        });

        return () => {
          unSub();
        };
      }
    };
    data.chatId && getMessages();
  }, [data.chatId, messages.length, currentUser.uid, data.user?.displayName, data.user?.photoURL]);

  const handleSend = async () => {
    if (text.trim() === "" && !img) return;

    if (img) {
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, img);

      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.error("Image upload error:", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text: text || "Resim gönderildi",
      },
      [data.chatId + ".date"]: Timestamp.now(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text: text || "Resim gönderildi",
      },
      [data.chatId + ".date"]: Timestamp.now(),
    });

    setText("");
    setImg(null);
  };

  const handleBack = () => {
    dispatch({ type: "RESET_CHAT" });
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSend();
  };

  return (
    <div className="chat">
      <div className="chatInfo">
        <button className="back-button" onClick={handleBack}>←</button>
        <span>{data.user?.displayName}</span>
        <div className="chatIcons"></div>
      </div>
      <div className="messages">
        {messages.map((m) => (
          <Message message={m} key={m.id} />
        ))}
      </div>
      {data.user?.uid && (
        <div className="input">
          <input
            type="text"
            placeholder="Mesajınızı yazın..."
            onChange={(e) => setText(e.target.value)}
            value={text}
            onKeyDown={handleKey}
          />
          <input
            type="file"
            style={{ display: "none" }}
            id="file"
            onChange={(e) => setImg(e.target.files[0])}
          />
          <label htmlFor="file">
            <img src="https://cdn-icons-png.flaticon.com/512/3342/3342/3342137.png" alt="" width="24" height="24" style={{ cursor: "pointer" }} />
          </label>
          <div className="send">
            <button onClick={handleSend}>Gönder</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
