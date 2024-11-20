// Importer de nødvendige funktioner fra Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBF06T7gandDM5M1yai2G6M_PNo9TrcLuE",
  authDomain: "vagtplan-app-25476.firebaseapp.com",
  projectId: "vagtplan-app-25476",
  storageBucket: "vagtplan-app-25476.appspot.com",
  messagingSenderId: "294112564740",
  appId: "1:294112564740:web:a89c295955d3fb0cc2c751",
  measurementId: "G-K7HQZYN99E"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Authentication og eksporter det
const auth = getAuth(app);

export { auth };
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Funktion til at registrere ny bruger
function registerUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('Bruger oprettet:', userCredential.user);
      return userCredential.user;
    })
    .catch((error) => {
      console.error('Fejl ved oprettelse af bruger:', error.message);
      throw error;
    });
}

// Funktion til login for eksisterende bruger
function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('Bruger logget ind:', userCredential.user);
      return userCredential.user;
    })
    .catch((error) => {
      console.error('Fejl ved login:', error.message);
      throw error;
    });
}

export { auth, registerUser, loginUser };
