import express from 'express';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Læs JSON-filen og parse den
const serviceAccount = JSON.parse(fs.readFileSync('./vagtplan-app-25476-firebase-adminsdk-mwuk7-b14db6a1bb.json', 'utf8'));

// Firebase-admin initialisering
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware til JSON-håndtering
app.use(express.json());

// Test-endpoint for at sikre, at serveren kører
app.get('/', (req, res) => {
  res.send('Backend fungerer!');
});

app.listen(PORT, () => {
  console.log(`Server kører på port ${PORT}`);
});
