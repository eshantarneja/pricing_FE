// Firebase configuration file
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration for pricing-eval-project
const firebaseConfig = {
  apiKey: "AIzaSyDgQVtNaZspI8d5t55crYXpeJ3gw4ZTUPQ",
  authDomain: "pricing-eval-project.firebaseapp.com",
  projectId: "pricing-eval-project",
  storageBucket: "pricing-eval-project.appspot.com",
  messagingSenderId: "269284373746",
  appId: "1:269284373746:web:d8f6f9e85a1e5c1ff33b6d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export initialized services
export { db };
