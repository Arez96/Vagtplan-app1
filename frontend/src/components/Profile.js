import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    margin: "0 10px",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  header: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    textAlign: "left",
  },
  field: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    marginBottom: "5px",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box",
  },
  readOnly: {
    fontSize: "14px",
    color: "#777",
    backgroundColor: "#f1f1f1",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  buttonContainer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
  },
  updateButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flex: "1",
    marginRight: "10px",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flex: "1",
  },
};

function Profile() {
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    email: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserDetails({
            ...userDoc.data(),
            email: user.email, // Email hentes fra auth
          });
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handleUpdate = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          phone: userDetails.phone,
          address: userDetails.address,
        });
        alert("Oplysninger opdateret!");
      }
    } catch (error) {
      console.error("Fejl ved opdatering af oplysninger:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Naviger tilbage til login-siden
    } catch (error) {
      console.error("Fejl ved log ud:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Din Profil</h1>
      <div style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Email (kan ikke ændres):</label>
          <p style={styles.readOnly}>{userDetails.email}</p>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Fornavn:</label>
          <input
            type="text"
            value={userDetails.firstName}
            onChange={(e) =>
              setUserDetails({ ...userDetails, firstName: e.target.value })
            }
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Efternavn:</label>
          <input
            type="text"
            value={userDetails.lastName}
            onChange={(e) =>
              setUserDetails({ ...userDetails, lastName: e.target.value })
            }
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Telefonnummer:</label>
          <input
            type="text"
            value={userDetails.phone}
            onChange={(e) =>
              setUserDetails({ ...userDetails, phone: e.target.value })
            }
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Adresse:</label>
          <input
            type="text"
            value={userDetails.address}
            onChange={(e) =>
              setUserDetails({ ...userDetails, address: e.target.value })
            }
            style={styles.input}
          />
        </div>
        <div style={styles.buttonContainer}>
          <button onClick={handleUpdate} style={styles.updateButton}>
            Opdater Profil
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Log Ud
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
