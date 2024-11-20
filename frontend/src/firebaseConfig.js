import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBF06T7gandDM5M1yai2G6M_PNo9TrcLuE",
  authDomain: "vagtplan-app-25476.firebaseapp.com",
  projectId: "vagtplan-app-25476",
  storageBucket: "vagtplan-app-25476.appspot.com",
  messagingSenderId: "294112564740",
  appId: "1:294112564740:web:a89c295955d3fb0cc2c751",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, setDoc, doc };
