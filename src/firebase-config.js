// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6TqXe-t5EYslcxvpA2H4cU5s0wiChhl4",
  authDomain: "adguessr-61019.firebaseapp.com",
  projectId: "adguessr-61019",
  storageBucket: "adguessr-61019.firebasestorage.app",
  messagingSenderId: "556990465168",
  appId: "1:556990465168:web:c999634eb2894bb045c415",
  measurementId: "G-36GLQF7G1N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };