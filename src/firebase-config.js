// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// If you add other Firebase services later, you'd import them here:
// import { getAuth } from 'firebase/auth'; // For Firebase Authentication
// import { getStorage } from 'firebase/storage'; // For Firebase Storage

// Your Firebase configuration object.
// These values are securely loaded from your .env file using Vite's `import.meta.env`
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional: Only if you're using Google Analytics for Firebase
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firestore service
const db = getFirestore(app);

// Export the initialized services so you can use them in other parts of your app
export { db };

// If you added other services, you'd export them too:
// export { db, auth, storage };