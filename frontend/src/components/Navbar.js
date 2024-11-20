import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaComments, FaUserShield } from "react-icons/fa";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

function Navbar() {
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // Hent brugerens rolle
        }
      }
    };

    fetchUserRole();
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        backgroundColor: "#333",
        color: "#fff",
        padding: "10px 0",
      }}
    >
      {/* Home */}
      <Link
        to="/home"
        style={{
          textAlign: "center",
          color: location.pathname === "/home" ? "orange" : "white",
          textDecoration: "none",
        }}
      >
        <FaHome size={24} />
        <p style={{ fontSize: "12px" }}>Home</p>
      </Link>

      {/* Calendar */}
      <Link
        to="/calendar"
        style={{
          textAlign: "center",
          color: location.pathname === "/calendar" ? "orange" : "white",
          textDecoration: "none",
        }}
      >
        <FaCalendarAlt size={24} />
        <p style={{ fontSize: "12px" }}>Calendar</p>
      </Link>

      {/* Chat */}
      <Link
        to="/chat"
        style={{
          textAlign: "center",
          color: location.pathname === "/chat" ? "orange" : "white",
          textDecoration: "none",
        }}
      >
        <FaComments size={24} />
        <p style={{ fontSize: "12px" }}>Chat</p>
      </Link>

      {/* Admin (kun for admin) */}
      {role === "admin" && (
        <Link
          to="/admin"
          style={{
            textAlign: "center",
            color: location.pathname === "/admin" ? "orange" : "white",
            textDecoration: "none",
          }}
        >
          <FaUserShield size={24} />
          <p style={{ fontSize: "12px" }}>Admin</p>
        </Link>
      )}
    </nav>
  );
}

export default Navbar;
