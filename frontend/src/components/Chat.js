import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, onSnapshot, addDoc, orderBy } from "firebase/firestore";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";

function Chat() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);

  const currentUserId = auth.currentUser.uid;

  useEffect(() => {
    const fetchUsers = () => {
      const usersQuery = collection(db, "users");
      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      });
      return () => unsubscribe();
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchChats = () => {
      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUserId)
      );

      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        const chatList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(chatList);
      });

      return () => unsubscribe();
    };

    fetchChats();
  }, [currentUserId]);

  useEffect(() => {
    if (activeChat) {
      const messagesRef = collection(db, "chats", activeChat.id, "messages");
      const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => doc.data());
        setMessages(messagesData);
      });

      return () => unsubscribe();
    }
  }, [activeChat]);

  const getOtherParticipantName = (chat) => {
    const otherParticipantId = chat.participants.find(
      (participant) => participant !== currentUserId
    );
    const otherParticipant = users.find((user) => user.id === otherParticipantId);
    return otherParticipant
      ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
      : "Ukendt";
  };

  const sendMessage = async () => {
    if (newMessage.trim() && activeChat) {
      const message = {
        senderId: currentUserId,
        text: newMessage,
        timestamp: new Date().toISOString(),
      };

      const messagesRef = collection(db, "chats", activeChat.id, "messages");
      await addDoc(messagesRef, message);
      setNewMessage("");
    }
  };

  const styles = {
    container: {
      margin: "20px",
      paddingBottom: "20px",
      backgroundColor: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "15px 20px",
      backgroundColor: "#4CAF50",
      color: "#fff",
      fontSize: "18px",
      borderTopLeftRadius: "10px",
      borderTopRightRadius: "10px",
    },
    chatContent: {
      height: "350px",
      overflowY: "auto",
      padding: "20px",
      backgroundColor: "#f9f9f9",
      marginBottom: "10px",
      borderRadius: "10px",
    },
    message: {
      marginBottom: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    senderMessage: {
      alignItems: "flex-end",
    },
    bubble: {
      display: "inline-block",
      padding: "15px",
      borderRadius: "15px",
      backgroundColor: "#f1f0f0",
      maxWidth: "75%",
      fontSize: "14px",
      lineHeight: "1.5",
    },
    senderBubble: {
      backgroundColor: "#DCF8C6",
    },
    timestamp: {
      fontSize: "10px",
      color: "#999",
      marginTop: "5px",
    },
    inputContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 20px",
      borderTop: "1px solid #ddd",
      backgroundColor: "#fff",
    },
    input: {
      flex: 1,
      padding: "12px",
      borderRadius: "25px",
      border: "1px solid #ccc",
    },
    sendButton: {
      padding: "12px",
      borderRadius: "50%",
      backgroundColor: "#4CAF50",
      color: "#fff",
      border: "none",
      cursor: "pointer",
    },
  };

  return (
    <div>
      <div style={styles.container}>
        {!activeChat && (
          <>
            <div style={styles.header}>
              <h1>Dine Samtaler</h1>
            </div>
            <div style={styles.chatContent}>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  style={{
                    padding: "15px",
                    marginBottom: "15px",
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    border: "1px solid #ddd",
                  }}
                >
                  <p style={{ fontWeight: "bold" }}>
                    {getOtherParticipantName(chat)}
                  </p>
                  <p style={{ fontSize: "12px", color: "#555" }}>
                    {chat.lastMessage || "Ingen beskeder endnu..."}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeChat && (
          <>
            <div style={styles.header}>
              <FaArrowLeft
                onClick={() => setActiveChat(null)}
                style={{ cursor: "pointer" }}
              />
              <span>Samtale med: {getOtherParticipantName(activeChat)}</span>
            </div>
            <div style={styles.chatContent}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.message,
                    ...(message.senderId === currentUserId && styles.senderMessage),
                  }}
                >
                  <div
                    style={{
                      ...styles.bubble,
                      ...(message.senderId === currentUserId && styles.senderBubble),
                    }}
                  >
                    {message.text}
                  </div>
                  <div style={styles.timestamp}>
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.inputContainer}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Skriv en besked..."
                style={styles.input}
              />
              <button
                onClick={sendMessage}
                style={styles.sendButton}
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
