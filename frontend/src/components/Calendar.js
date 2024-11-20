import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";

function Calendar() {
  const [shifts, setShifts] = useState([]); // Liste over vagter
  const [users, setUsers] = useState([]); // Liste over brugere
  const [newShift, setNewShift] = useState({ date: "", startTime: "", endTime: "", employeeId: "" }); // Ny vagt
  const [editingShift, setEditingShift] = useState(null); // Den vagt, der redigeres
  const [role, setRole] = useState(null); // Brugerens rolle

  // Hent data fra Firestore
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const shiftsCollection = collection(db, "shifts");
        const shiftDocs = await getDocs(shiftsCollection);
        const shiftList = shiftDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShifts(shiftList);
      } catch (error) {
        console.error("Fejl ved hentning af vagter:", error);
      }
    };

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

    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // Sæt brugerens rolle
        }
      }
    };

    fetchShifts();
    fetchUsers();
    fetchUserRole();
  }, []);

  // Tilføj en ny vagt
  const handleAddShift = async () => {
    if (newShift.date && newShift.startTime && newShift.endTime && newShift.employeeId) {
      try {
        const employee = users.find((user) => user.id === newShift.employeeId); // Find medarbejderen
        const newShiftWithEmployee = {
          ...newShift,
          employeeName: `${employee.firstName} ${employee.lastName}`, // Tilføj medarbejderens navn
        };

        const shiftsCollection = collection(db, "shifts");
        const docRef = await addDoc(shiftsCollection, newShiftWithEmployee);
        setShifts((prev) => [...prev, { id: docRef.id, ...newShiftWithEmployee }]);
        setNewShift({ date: "", startTime: "", endTime: "", employeeId: "" }); // Nulstil inputfelter
      } catch (error) {
        console.error("Fejl ved tilføjelse af vagt:", error);
      }
    } else {
      alert("Udfyld alle felterne for at tilføje en ny vagt.");
    }
  };

  // Start redigering af en vagt
  const handleEditShift = (shift) => {
    setEditingShift(shift); // Sæt vagten til redigering
  };

  // Gem opdateret vagt
  const handleUpdateShift = async () => {
    if (editingShift.date && editingShift.startTime && editingShift.endTime && editingShift.employeeId) {
      try {
        const employee = users.find((user) => user.id === editingShift.employeeId); // Find medarbejderens navn
        const updatedShift = {
          ...editingShift,
          employeeName: `${employee.firstName} ${employee.lastName}`, // Opdater medarbejderens navn
        };

        const shiftDoc = doc(db, "shifts", editingShift.id);
        await updateDoc(shiftDoc, updatedShift); // Gem opdateringer i Firestore
        setShifts((prev) =>
          prev.map((shift) => (shift.id === editingShift.id ? updatedShift : shift))
        );
        setEditingShift(null); // Afslut redigering
      } catch (error) {
        console.error("Fejl ved opdatering af vagt:", error);
      }
    } else {
      alert("Udfyld alle felterne for at opdatere vagten.");
    }
  };

  // Slet en vagt
  const handleDeleteShift = async (id) => {
    try {
      await deleteDoc(doc(db, "shifts", id));
      setShifts((prev) => prev.filter((shift) => shift.id !== id));
    } catch (error) {
      console.error("Fejl ved sletning af vagt:", error);
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <h1>Vagtplan</h1>

      {/* Liste over vagter */}
      {shifts
        .filter((shift) =>
          role === "admin" ? true : shift.employeeId === auth.currentUser.uid // Filtrer vagter baseret på brugerens rolle
        )
        .map((shift) => (
          <div
            key={shift.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            {editingShift && editingShift.id === shift.id ? (
              <div>
                <input
                  type="date"
                  value={editingShift.date}
                  onChange={(e) =>
                    setEditingShift({ ...editingShift, date: e.target.value })
                  }
                  style={{ marginRight: "10px" }}
                />
                <input
                  type="time"
                  value={editingShift.startTime}
                  onChange={(e) =>
                    setEditingShift({ ...editingShift, startTime: e.target.value })
                  }
                  style={{ marginRight: "10px" }}
                />
                <input
                  type="time"
                  value={editingShift.endTime}
                  onChange={(e) =>
                    setEditingShift({ ...editingShift, endTime: e.target.value })
                  }
                  style={{ marginRight: "10px" }}
                />
                <select
                  value={editingShift.employeeId}
                  onChange={(e) =>
                    setEditingShift({ ...editingShift, employeeId: e.target.value })
                  }
                  style={{ marginRight: "10px" }}
                >
                  <option value="">Vælg Medarbejder</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleUpdateShift}
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  Gem
                </button>
                <button
                  onClick={() => setEditingShift(null)}
                  style={{
                    backgroundColor: "gray",
                    color: "white",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Annuller
                </button>
              </div>
            ) : (
              <div>
                <p><strong>Dato:</strong> {shift.date}</p>
                <p><strong>Starttid:</strong> {shift.startTime}</p>
                <p><strong>Sluttid:</strong> {shift.endTime}</p>
                <p><strong>Medarbejder:</strong> {shift.employeeName || "Ikke valgt"}</p>
                {role === "admin" && (
                  <>
                    <button
                      onClick={() => handleEditShift(shift)}
                      style={{
                        backgroundColor: "blue",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "10px",
                      }}
                    >
                      Rediger
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Slet
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

      {/* Kun admins kan tilføje vagter */}
      {role === "admin" && (
        <>
          <h3>Tilføj ny vagt</h3>
          <input
            type="date"
            value={newShift.date}
            onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
            style={{ marginRight: "10px" }}
          />
          <input
            type="time"
            placeholder="Starttid"
            value={newShift.startTime}
            onChange={(e) =>
              setNewShift({ ...newShift, startTime: e.target.value })
            }
            style={{ marginRight: "10px" }}
          />
          <input
            type="time"
            placeholder="Sluttid"
            value={newShift.endTime}
            onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
            style={{ marginRight: "10px" }}
          />
          <select
            value={newShift.employeeId}
            onChange={(e) => setNewShift({ ...newShift, employeeId: e.target.value })}
            style={{ marginRight: "10px" }}
          >
            <option value="">Vælg Medarbejder</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddShift}
            style={{
              backgroundColor: "blue",
              color: "white",
              padding: "5px 10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Tilføj Vagt
          </button>
        </>
      )}
    </div>
  );
}

export default Calendar;
