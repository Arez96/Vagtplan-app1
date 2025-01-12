import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, setDoc, doc } from "../firebaseConfig";
import logo from "../assets/logo.png"; // Importér logoet

function Login() {
  const [email, setEmail] = useState(""); // Holder email-inputtet
  const [password, setPassword] = useState(""); // Holder password-inputtet
  const [isRegistering, setIsRegistering] = useState(false); // Skifter mellem login og opret konto
  const [error, setError] = useState(""); // Viser fejlmeddelelser
  const navigate = useNavigate(); // Bruges til at navigere mellem sider

  // Håndtering af oprettelse af konto
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Tildel rollen 'employee' som standard og gem i Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        role: "employee", // Standardrolle
      });

      navigate("/admin"); // Navigér til Admin-siden efter oprettelse
    } catch (err) {
      setError("Oprettelse fejlede: " + err.message); // Viser fejlmeddelelse
    }
  };

  // Håndtering af login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin"); // Navigér til Admin-siden efter login
    } catch (err) {
      setError("Login fejlede: " + err.message); // Viser fejlmeddelelse
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        backgroundColor: "#d0d7d9", // Opdateret baggrundsfarve
        minHeight: "100vh", // Dækker hele skærmen
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Logo */}
      <img src={logo} alt="Logo" style={{ width: "150px", marginBottom: "20px" }} />

      <h1>Velkommen til Vagtplan App</h1>
      <p>Log ind eller opret en konto</p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Formular til login eller oprettelse */}
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: "10px", padding: "8px", width: "80%" }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Adgangskode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: "10px", padding: "8px", width: "80%" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {isRegistering ? "Opret Konto" : "Log Ind"}
        </button>
      </form>

      {/* Skift mellem login og oprettelse */}
      <p style={{ marginTop: "20px" }}>
        {isRegistering ? "Har du allerede en konto?" : "Ingen konto?"}{" "}
        <span
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ color: "blue", cursor: "pointer" }}
        >
          {isRegistering ? "Log ind" : "Opret en konto"}
        </span>
      </p>
    </div>
  );
}

export default Login;
