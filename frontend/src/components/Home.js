// File: src/components/Home.js

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Card, CardContent, Grid, Divider, Modal } from "@mui/material";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import calendar styles
import Countdown from "react-countdown";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();
  const [nextShift, setNextShift] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({ hoursWorked: 0, upcomingShifts: 0 });
  const [notifications, setNotifications] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch data when the component loads
  useEffect(() => {
    fetchNextShift();
    fetchRecentActivities();
    fetchStats();
    fetchNotifications();
    fetchAllShifts();
  }, []);

  // Fetch the next shift for the logged-in user
  const fetchNextShift = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const shiftsRef = collection(db, "shifts");
      const q = query(
        shiftsRef,
        where("employeeId", "==", userId),
        where("date", ">=", new Date().toISOString().split("T")[0]),
        orderBy("date", "asc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const next = snapshot.docs[0].data();
        setNextShift({
          date: new Date(next.date).toLocaleDateString(),
          time: `${next.startTime} - ${next.endTime}`,
          tasks: next.tasks || "Ingen opgaver",
          location: next.location || "Ukendt sted",
        });
      }
    } catch (error) {
      console.error("Fejl ved hentning af næste vagt:", error);
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const activitiesRef = collection(db, "activities");
      const q = query(activitiesRef, where("employeeId", "==", userId), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      setRecentActivities(snapshot.docs.map((doc) => doc.data().description));
    } catch (error) {
      console.error("Fejl ved hentning af aktiviteter:", error);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const shiftsRef = collection(db, "shifts");
      const q = query(shiftsRef, where("employeeId", "==", userId), where("date", ">=", new Date().toISOString().split("T")[0]));
      const snapshot = await getDocs(q);
      setStats({
        hoursWorked: snapshot.docs.reduce((total, doc) => total + (doc.data().hours || 0), 0),
        upcomingShifts: snapshot.size,
      });
    } catch (error) {
      console.error("Fejl ved hentning af statistik:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, where("employeeId", "==", userId), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      setNotifications(snapshot.docs.map((doc) => doc.data().message));
    } catch (error) {
      console.error("Fejl ved hentning af notifikationer:", error);
    }
  };

  // Fetch all shifts for the pop-up
  const fetchAllShifts = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const shiftsRef = collection(db, "shifts");
      const q = query(
        shiftsRef,
        where("employeeId", "==", userId),
        where("date", ">=", new Date().toISOString().split("T")[0]),
        orderBy("date", "asc")
      );
      const snapshot = await getDocs(q);
      const shifts = snapshot.docs.map((doc) => ({
        ...doc.data(),
        date: new Date(doc.data().date).toLocaleDateString(),
      }));
      setAllShifts(shifts);
    } catch (error) {
      console.error("Fejl ved hentning af alle vagter:", error);
    }
  };

  // Modal handling
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  return (
    <Box p={3}>
      {/* Velkomsttekst */}
      <Typography variant="h4" gutterBottom>
        Velkommen til Vagtplan App
      </Typography>
      <Typography variant="subtitle1">
        Effektiv vagtplanlægning og kommunikation for din arbejdsplads.
      </Typography>

      {/* Profil-knap */}
      <Box sx={{ textAlign: "right", mt: 3 }}>
        <Button
          onClick={() => navigate("/profile")}
          variant="contained"
          sx={{
            backgroundColor: "#1976d2",
            padding: "10px 15px",
            fontSize: "14px",
          }}
        >
          Profil
        </Button>
      </Box>

      {/* Næste vagt */}
      <Card sx={{ my: 3, bgcolor: "#28a745", color: "white" }}>
        <CardContent>
          <Typography variant="h6">Din næste vagt:</Typography>
          {nextShift ? (
            <>
              <Typography variant="body1">Dato: {nextShift.date}</Typography>
              <Typography variant="body1">Tid: {nextShift.time}</Typography>
              <Typography variant="body1">Opgaver: {nextShift.tasks}</Typography>
              <Typography variant="body1">Lokation: {nextShift.location}</Typography>
              <Typography variant="body1">
                Countdown: <Countdown date={new Date(nextShift.date)} />
              </Typography>
            </>
          ) : (
            <Typography variant="body1">Ingen kommende vagter.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Genveje */}
      <Grid container spacing={2} sx={{ my: 3 }}>
        <Grid item xs={6}>
          <Button variant="contained" fullWidth onClick={handleModalOpen}>
            Se alle vagter
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" fullWidth onClick={() => navigate("/check-in-out")}>
            Tjek ind/ud
          </Button>
        </Grid>
      </Grid>

      {/* Aktiviteter */}
      <Card sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h6">Seneste aktiviteter:</Typography>
          <Divider sx={{ my: 1 }} />
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <Typography key={index} variant="body1">- {activity}</Typography>
            ))
          ) : (
            <Typography variant="body1">Ingen aktiviteter fundet.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Notifikationer */}
      <Card sx={{ my: 3, bgcolor: "#ff8c00" }}>
        <CardContent>
          <Typography variant="h6">Notifikationer:</Typography>
          <Divider sx={{ my: 1 }} />
          {notifications.length > 0 ? (
            notifications.map((note, index) => (
              <Typography key={index} variant="body1">- {note}</Typography>
            ))
          ) : (
            <Typography variant="body1">Ingen nye notifikationer.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Statistik */}
      <Card sx={{ my: 3, bgcolor: "#007bff", color: "white" }}>
        <CardContent>
          <Typography variant="h6">Statistik:</Typography>
          <Typography variant="body1">Timer arbejdet denne uge: {stats.hoursWorked}</Typography>
          <Typography variant="body1">Kommende vagter: {stats.upcomingShifts}</Typography>
        </CardContent>
      </Card>

      {/* Kalender */}
      <Card sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h6">Kalender:</Typography>
          <Calendar />
        </CardContent>
      </Card>

      {/* Pop-up med alle vagter */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            p: 4,
            backgroundColor: "white",
            margin: "10% auto",
            borderRadius: "10px",
            maxWidth: "600px",
          }}
        >
          <Typography variant="h6" gutterBottom>Alle vagter</Typography>
          {allShifts.length > 0 ? (
            allShifts.map((shift, index) => (
              <Typography key={index} variant="body1">
                - {shift.date}: {shift.startTime} - {shift.endTime}, {shift.location || "Ukendt"}
              </Typography>
            ))
          ) : (
            <Typography variant="body1">Ingen vagter fundet.</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Home;
