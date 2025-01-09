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
          setRole(userDoc.data().role);
        }
      }
    };

    fetchUserRole();
  }, []);

  const styles = {
    navbar: {
      position: "fixed",
      bottom: -10,
      width: "100%",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: "#333",
      color: "#fff",
      padding: "10px 0",
      zIndex: 1000, // Sørg for, at navbaren er øverst
      borderTop: "2px solid #444",
    },
    link: {
      textAlign: "center",
      color: "white",
      textDecoration: "none",
    },
    activeLink: {
      color: "orange",
    },
    iconText: {
      fontSize: "12px",
      marginTop: "5px",
    },
  };

  return (
    <nav style={styles.navbar}>
      <Link
        to="/home"
        style={{
          ...styles.link,
          ...(location.pathname === "/home" ? styles.activeLink : {}),
        }}
      >
        <FaHome size={24} />
        <p style={styles.iconText}>Home</p>
      </Link>
      <Link
        to="/calendar"
        style={{
          ...styles.link,
          ...(location.pathname === "/calendar" ? styles.activeLink : {}),
        }}
      >
        <FaCalendarAlt size={24} />
        <p style={styles.iconText}>Calendar</p>
      </Link>
      <Link
        to="/chat"
        style={{
          ...styles.link,
          ...(location.pathname === "/chat" ? styles.activeLink : {}),
        }}
      >
        <FaComments size={24} />
        <p style={styles.iconText}>Chat</p>
      </Link>
      {role === "admin" && (
        <Link
          to="/admin"
          style={{
            ...styles.link,
            ...(location.pathname === "/admin" ? styles.activeLink : {}),
          }}
        >
          <FaUserShield size={24} />
          <p style={styles.iconText}>Admin</p>
        </Link>
      )}
    </nav>
  );
}

export default Navbar;
