import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

const styles = {
  container: {
    margin: "0 10px 50px",
    padding: "20px",
    maxWidth: "800px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  adminControls: {
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  editButton: {
    backgroundColor: "#2196F3",
    color: "white",
    marginRight: "10px",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "white",
  },
  shiftList: {
    marginTop: "20px",
    maxHeight: "400px",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "10px",
  },
  shiftItem: {
    padding: "15px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fdfdfd",
  },
};

function Calendar() {
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newShift, setNewShift] = useState({
    date: "",
    startTime: "",
    endTime: "",
    employeeId: "",
  });
  const [editingShift, setEditingShift] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchShifts = async () => {
      const shiftsCollection = collection(db, "shifts");
      const shiftDocs = await getDocs(shiftsCollection);
      const shiftList = shiftDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShifts(shiftList);
    };

    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const userDocs = await getDocs(usersCollection);
      const userList = userDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    };

    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
    };

    fetchShifts();
    fetchUsers();
    fetchUserRole();
  }, []);

  const handleAddShift = async () => {
    if (newShift.date && newShift.startTime && newShift.endTime && newShift.employeeId) {
      const employee = users.find((user) => user.id === newShift.employeeId);
      const newShiftWithEmployee = {
        ...newShift,
        employeeName: `${employee.firstName} ${employee.lastName}`,
      };

      const shiftsCollection = collection(db, "shifts");
      const docRef = await addDoc(shiftsCollection, newShiftWithEmployee);
      setShifts((prev) => [...prev, { id: docRef.id, ...newShiftWithEmployee }]);
      setNewShift({ date: "", startTime: "", endTime: "", employeeId: "" });
    } else {
      alert("Udfyld alle felterne for at tilføje en ny vagt.");
    }
  };

  const handleEditShift = (shift) => setEditingShift(shift);

  const handleUpdateShift = async () => {
    const employee = users.find((user) => user.id === editingShift.employeeId);
    const updatedShift = {
      ...editingShift,
      employeeName: `${employee.firstName} ${employee.lastName}`,
    };

    const shiftDoc = doc(db, "shifts", editingShift.id);
    await updateDoc(shiftDoc, updatedShift);
    setShifts((prev) =>
      prev.map((shift) => (shift.id === editingShift.id ? updatedShift : shift))
    );
    setEditingShift(null);
  };

  const handleDeleteShift = async (id) => {
    const shiftDoc = doc(db, "shifts", id);
    await deleteDoc(shiftDoc);
    setShifts((prev) => prev.filter((shift) => shift.id !== id));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Vagtplan</h1>

      {role === "admin" && (
        <div style={styles.adminControls}>
          <h3>Tilføj ny vagt</h3>
          <div style={styles.inputGroup}>
            <input
              type="date"
              value={newShift.date}
              onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
              style={styles.input}
            />
            <input
              type="time"
              value={newShift.startTime}
              onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
              style={styles.input}
            />
            <input
              type="time"
              value={newShift.endTime}
              onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
              style={styles.input}
            />
            <select
              value={newShift.employeeId}
              onChange={(e) => setNewShift({ ...newShift, employeeId: e.target.value })}
              style={styles.input}
            >
              <option value="">Vælg Medarbejder</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            <button onClick={handleAddShift} style={{ ...styles.button, ...styles.addButton }}>
              Tilføj Vagt
            </button>
          </div>
        </div>
      )}

      <div style={styles.shiftList}>
        {shifts
          .filter((shift) => role === "admin" || shift.employeeId === auth.currentUser.uid)
          .map((shift) => (
            <div key={shift.id} style={styles.shiftItem}>
              {editingShift && editingShift.id === shift.id ? (
                <div style={styles.inputGroup}>
                  <input
                    type="date"
                    value={editingShift.date}
                    onChange={(e) => setEditingShift({ ...editingShift, date: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="time"
                    value={editingShift.startTime}
                    onChange={(e) => setEditingShift({ ...editingShift, startTime: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="time"
                    value={editingShift.endTime}
                    onChange={(e) => setEditingShift({ ...editingShift, endTime: e.target.value })}
                    style={styles.input}
                  />
                  <select
                    value={editingShift.employeeId}
                    onChange={(e) => setEditingShift({ ...editingShift, employeeId: e.target.value })}
                    style={styles.input}
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
                    style={{ ...styles.button, ...styles.editButton }}
                  >
                    Gem
                  </button>
                  <button
                    onClick={() => setEditingShift(null)}
                    style={{ ...styles.button, backgroundColor: "gray", color: "white" }}
                  >
                    Annuller
                  </button>
                </div>
              ) : (
                <>
                  <p>
                    <strong>Dato:</strong> {shift.date}
                  </p>
                  <p>
                    <strong>Starttid:</strong> {shift.startTime}
                  </p>
                  <p>
                    <strong>Sluttid:</strong> {shift.endTime}
                  </p>
                  <p>
                    <strong>Medarbejder:</strong> {shift.employeeName || "Ikke valgt"}
                  </p>
                  {role === "admin" && (
                    <>
                      <button
                        onClick={() => handleEditShift(shift)}
                        style={{ ...styles.button, ...styles.editButton }}
                      >
                        Rediger
                      </button>
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        style={{ ...styles.button, ...styles.deleteButton }}
                      >
                        Slet
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Calendar;
