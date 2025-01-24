// File: src/components/Admin.js

import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const styles = {
  container: {
    margin: "0 auto",
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    maxWidth: "100%",
    overflowX: "hidden",
    minHeight: "100vh", // Minimum højde for hele skærmen
    paddingBottom: "200px", // Ekstra plads til scrolling
  },
  header: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
    marginTop: "20px",
  },
  stats: {
    display: "flex",
    justifyContent: "center",
    margin: "10px 10px 20px 10px",
    gap: "10px",
    
  },
  statCard: {
    flex: "1",
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#4caf50",
  },
  statLabel: {
    fontSize: "16px",
    color: "#555",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    margin: "10px 10px 20px 10px",
  },
  card: {
    padding: "15px",
    borderRadius: "10px",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: "white",
  },
  adminButton: {
    backgroundColor: "#4caf50",
  },
  employeeButton: {
    backgroundColor: "#ff9800",
  },
  modal: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    zIndex: 1000,
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
};

function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, admins: 0, employees: 0 });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userDocs = await getDocs(usersCollection);
        const userList = userDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);

        const totalUsers = userList.length;
        const admins = userList.filter((user) => user.role === "admin").length;
        const employees = totalUsers - admins;

        setStats({ totalUsers, admins, employees });
      } catch (error) {
        console.error("Fejl ved hentning af brugere:", error);
      }
    };

    fetchUsers();
  }, []);

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

  const openProfile = (user) => {
    setSelectedUser(user);
  };

  const closeProfile = () => {
    setSelectedUser(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Dashboard</h1>

      {/* Statistik-sektion */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalUsers}</div>
          <div style={styles.statLabel}>Samlet Brugere</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.admins}</div>
          <div style={styles.statLabel}>Administratorer</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.employees}</div>
          <div style={styles.statLabel}>Medarbejdere</div>
        </div>
      </div>

      {/* Liste over brugere */}
      <div style={styles.list}>
        {users.map((user) => (
          <div key={user.id} style={styles.card}>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Rolle:</strong>{" "}
              <span
                style={{
                  color: user.role === "admin" ? "green" : "orange",
                  fontWeight: "bold",
                }}
              >
                {user.role === "admin" ? "Admin" : "Medarbejder"}
              </span>
            </p>
            <button
              onClick={() => openProfile(user)}
              style={{
                ...styles.button,
                backgroundColor: "#2196f3",
              }}
            >
              Se Profil
            </button>
            <button
              onClick={() => toggleRole(user.id, user.role)}
              style={{
                ...styles.button,
                ...(user.role === "admin"
                  ? styles.adminButton
                  : styles.employeeButton),
              }}
            >
              Skift til {user.role === "admin" ? "Medarbejder" : "Admin"}
            </button>
          </div>
        ))}
      </div>

      {/* Profilmodal */}
      {selectedUser && (
        <>
          <div style={styles.modal}>
            <h2>Brugerprofil</h2>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Rolle:</strong>{" "}
              {selectedUser.role === "admin" ? "Admin" : "Medarbejder"}
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
                ...styles.button,
                backgroundColor: "red",
                marginTop: "15px",
              }}
            >
              Luk
            </button>
          </div>
          <div style={styles.overlay} onClick={closeProfile}></div>
        </>
      )}
    </div>
  );
}

export default Admin;
