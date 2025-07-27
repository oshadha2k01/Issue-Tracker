import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCWV-7YbdUbHeN_40HIZDTToSfM1TxG4aQ",
  authDomain: "issuetracker-2f7db.firebaseapp.com",
  projectId: "issuetracker-2f7db",
  storageBucket: "issuetracker-2f7db.firebasestorage.app",
  messagingSenderId: "858267710262",
  appId: "1:858267710262:web:9a5bb25fecc41e7b3c3997",
  measurementId: "G-KGF1Z2B6FX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
