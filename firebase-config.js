import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: Replace with your actual project config keys
const firebaseConfig = {
  apiKey: "AIzaSyCmVl6Io9Ha0BkmooQLxyQhvQJ31LB4dWE",
  authDomain: "hms-f6f3e.firebaseapp.com",
  projectId: "hms-f6f3e",
  storageBucket: "hms-f6f3e.firebasestorage.app",
  messagingSenderId: "1057112028062",
  appId: "1:1057112028062:web:cefc674e2ee584cc969c8f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('✓ Firebase initialized successfully');
console.log('Auth instance:', auth);
console.log('Firestore instance:', db);

export { auth, db };