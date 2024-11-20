import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

function Admin() {
  const [users, setUsers] = useState([]); // Liste over brugere
  const [selectedUser, setSelectedUser] = useState(null); // Den bruger, der vises i profilen
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Styrer dropdown

  useEffect(() => {
    // Hent brugere fra Firestore
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userDocs = await getDocs(usersCollection);
        const userList = userDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Fejl ved hentning af brugere:", error);
      }
    };

    fetchUsers();
  }, []);

  // Skift rolle mellem "admin" og "employee"
  const toggleRole = async (userId, currentRole) => {
    try {
      const userDoc = doc(db, "users", userId);
      const newRole = currentRole === "admin" ? "employee" : "admin";
      await updateDoc(userDoc, { role: newRole });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Fejl ved ændring af rolle:", error);
    }
  };

  // Åbn profilvisning for en bruger
  const openProfile = (user) => {
    setSelectedUser(user);
  };

  // Luk profilvisning
  const closeProfile = () => {
    setSelectedUser(null);
  };

  return (
    <div style={{ margin: "20px" }}>
      <h1>Admin - Brugere</h1>

      {/* Dropdown til at vise/skjule brugere */}
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={{
          cursor: "pointer",
          padding: "10px",
          backgroundColor: "#333",
          color: "white",
          textAlign: "center",
          borderRadius: "5px",
          marginBottom: "10px",
        }}
      >
        {isDropdownOpen ? "Skjul Brugere" : "Vis Brugere"}
      </div>

      {/* Liste over brugere (kun synlig, når dropdown er åben) */}
      {isDropdownOpen && (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {users.map((user) => (
            <li
              key={user.id}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <button
                  onClick={() => openProfile(user)}
                  style={{
                    backgroundColor: "blue",
                    color: "white",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Se Profil
                </button>
              </div>
              <button
                onClick={() => toggleRole(user.id, user.role)}
                style={{
                  backgroundColor: user.role === "admin" ? "green" : "gray",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {user.role === "admin" ? "Admin" : "Employee"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal til profilvisning */}
      {selectedUser && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            zIndex: 1000,
            width: "90%",
            maxWidth: "400px",
          }}
        >
          <h2>Profil</h2>
          <p>
            <strong>Navn:</strong> {selectedUser.firstName || "Ikke angivet"}{" "}
            {selectedUser.lastName || "Ikke angivet"}
          </p>
          <p>
            <strong>Email:</strong> {selectedUser.email}
          </p>
          <p>
            <strong>Telefon:</strong> {selectedUser.phone || "Ikke angivet"}
          </p>
          <p>
            <strong>Adresse:</strong> {selectedUser.address || "Ikke angivet"}
          </p>
          <button
            onClick={closeProfile}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Luk
          </button>
        </div>
      )}

      {/* Baggrunds-overlay for modal */}
      {selectedUser && (
        <div
          onClick={closeProfile}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        ></div>
      )}
    </div>
  );
}

export default Admin;
