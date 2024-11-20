import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, onSnapshot, addDoc, orderBy } from "firebase/firestore";

function Chat() {
  const [chats, setChats] = useState([]); // Liste over samtaler
  const [activeChat, setActiveChat] = useState(null); // Aktiv samtale
  const [messages, setMessages] = useState([]); // Beskeder i aktiv samtale
  const [newMessage, setNewMessage] = useState(""); // Inputfelt for besked
  const [isNewChat, setIsNewChat] = useState(false); // Hvis en ny samtale oprettes
  const [users, setUsers] = useState([]); // Liste over brugere
  const [selectedUser, setSelectedUser] = useState(null); // Valgt bruger for ny samtale

  const currentUserId = auth.currentUser.uid; // ID for den nuværende bruger

  // Hent alle brugere (til navne)
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

  // Hent samtaler for den aktuelle bruger
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

  // Hent beskeder for aktiv samtale
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

  // Find modpartens navn
  const getOtherParticipantName = (chat) => {
    const otherParticipantId = chat.participants.find(
      (participant) => participant !== currentUserId
    );
    const otherParticipant = users.find((user) => user.id === otherParticipantId);
    return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : "Ukendt";
  };

  // Start en ny samtale
  const startNewChat = async () => {
    if (selectedUser) {
      const existingChat = chats.find((chat) =>
        chat.participants.includes(selectedUser.id)
      );

      if (existingChat) {
        setActiveChat(existingChat);
      } else {
        const newChat = {
          participants: [currentUserId, selectedUser.id],
        };

        const chatRef = await addDoc(collection(db, "chats"), newChat);
        setActiveChat({ id: chatRef.id, ...newChat });
      }

      setIsNewChat(false);
    }
  };

  // Send en besked
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

  return (
    <div style={{ margin: "20px" }}>
      {!activeChat && !isNewChat && (
        <>
          <h1>Dine Samtaler</h1>
          <button
            onClick={() => setIsNewChat(true)}
            style={{
              backgroundColor: "blue",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Start ny Samtale
          </button>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {chats.map((chat) => (
              <li
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  marginBottom: "10px",
                  cursor: "pointer",
                }}
              >
                <p>
                  <strong>{getOtherParticipantName(chat)}</strong>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      {isNewChat && (
        <>
          <h1>Start ny Samtale</h1>
          <select
            onChange={(e) =>
              setSelectedUser(users.find((user) => user.id === e.target.value))
            }
            value={selectedUser?.id || ""}
            style={{ marginBottom: "20px", padding: "10px" }}
          >
            <option value="">Vælg en bruger</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
          <button
            onClick={startNewChat}
            style={{
              backgroundColor: "blue",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Start Samtale
          </button>
          <button
            onClick={() => setIsNewChat(false)}
            style={{
              backgroundColor: "gray",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Tilbage
          </button>
        </>
      )}

      {activeChat && (
        <>
          <button
            onClick={() => setActiveChat(null)}
            style={{
              backgroundColor: "gray",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              marginBottom: "20px",
            }}
          >
            Tilbage
          </button>
          <h1>Samtale med: {getOtherParticipantName(activeChat)}</h1>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "scroll",
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "20px",
            }}
          >
            {messages.map((message, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <strong>
                  {message.senderId === currentUserId
                    ? "Du"
                    : getOtherParticipantName(activeChat)}
                </strong>
                <p>{message.text}</p>
                <small>{new Date(message.timestamp).toLocaleString()}</small>
              </div>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Skriv en besked..."
            style={{ width: "80%", marginRight: "10px", padding: "10px" }}
          />
          <button onClick={sendMessage} style={{ padding: "10px 20px" }}>
            Send
          </button>
        </>
      )}
    </div>
  );
}

export default Chat;
