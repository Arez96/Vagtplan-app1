import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Calendar from "./components/Calendar";
import Chat from "./components/Chat"; // Importér Chat-siden
import Admin from "./components/Admin"; // Importér Admin-siden
import Profile from "./components/Profile";
import Login from "./components/Login";
import Navbar from "./components/Navbar"; // Importér Navbar
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // Hent brugerens rolle
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      {user ? (
        <>
          <Navbar />
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/chat" element={<Chat />} />
            {role === "admin" && <Route path="/admin" element={<Admin />} />}
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
