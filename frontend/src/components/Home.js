import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Velkommen til Vagtplan App</h1>
      <p>Dette er din startside</p>

      {/* Profil-knap */}
      <button
        onClick={() => navigate("/profile")}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "10px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Profiler
      </button>
    </div>
  );
}

export default Home;
