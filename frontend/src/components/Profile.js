import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Din Profil</h1>
      <div style={{ marginTop: "20px" }}>
        <label>Email (kan ikke ændres):</label>
        <p>{userDetails.email}</p>
        <div>
          <label>Fornavn:</label>
          <input
            type="text"
            value={userDetails.firstName}
            onChange={(e) =>
              setUserDetails({ ...userDetails, firstName: e.target.value })
            }
            style={{ marginBottom: "10px", padding: "8px", width: "80%" }}
          />
        </div>
        <div>
          <label>Efternavn:</label>
          <input
            type="text"
            value={userDetails.lastName}
            onChange={(e) =>
              setUserDetails({ ...userDetails, lastName: e.target.value })
            }
            style={{ marginBottom: "10px", padding: "8px", width: "80%" }}
          />
        </div>
        <div>
          <label>Telefonnummer:</label>
          <input
            type="text"
            value={userDetails.phone}
            onChange={(e) =>
              setUserDetails({ ...userDetails, phone: e.target.value })
            }
            style={{ marginBottom: "10px", padding: "8px", width: "80%" }}
          />
        </div>
        <div>
          <label>Adresse:</label>
          <input
            type="text"
            value={userDetails.address}
            onChange={(e) =>
              setUserDetails({ ...userDetails, address: e.target.value })
            }
            style={{ marginBottom: "10px", padding: "8px", width: "80%" }}
          />
        </div>
        <button
          onClick={handleUpdate}
          style={{
            padding: "10px 20px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Opdater Profil
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Log Ud
        </button>
      </div>
    </div>
  );
}

export default Profile;
