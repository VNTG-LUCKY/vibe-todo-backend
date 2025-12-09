// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIKMS6iF_t5du1RNs1XPZejjP8MznmAtY",
  authDomain: "lucky-todo-backend.firebaseapp.com",
  projectId: "lucky-todo-backend",
  storageBucket: "lucky-todo-backend.firebasestorage.app",
  messagingSenderId: "594135235440",
  appId: "1:594135235440:web:87eae47893ad1e6c97adb5",
  databaseURL: "https://lucky-todo-backend-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

