// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- REEMPLAZA ESTO CON TUS CLAVES REALES DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSxxxxxxxxxxxxxxxxxxxxxxx",       // Tu clave real
  authDomain: "tu-proyecto-real.firebaseapp.com", // Tu dominio real
  projectId: "tu-proyecto-real",                // Tu ID de proyecto real
  storageBucket: "tu-proyecto-real.appspot.com",  // Tu bucket real
  messagingSenderId: "1234567890",              // Tu sender ID real
  appId: "1:1234567890:web:xxxxxxxxxxxxxx"      // Tu App ID real
};
// --- FIN DE LA SECCIÓN A REEMPLAZAR ---

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };