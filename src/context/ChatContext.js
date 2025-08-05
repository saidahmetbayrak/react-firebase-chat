
import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const INITIAL_STATE = {
    chatId: null,
    user: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        const selectedUser = action.payload;

        // Ensure currentUser and selectedUser are valid before proceeding
        if (!currentUser || !currentUser.uid || !selectedUser || !selectedUser.uid) {
          return {
            chatId: "null",
            user: {},
          };
        }

        return {
          user: selectedUser,
          chatId:
            currentUser.uid > selectedUser.uid
              ? currentUser.uid + selectedUser.uid
              : selectedUser.uid + currentUser.uid,
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
