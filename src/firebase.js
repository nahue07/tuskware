import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore' // ← este es el que falta

const firebaseConfig = {
  apiKey: "AIzaSyDL73f5MmZjPyYHu7fg3Wj40aLJra_eYkA",
  authDomain: "tuskware-493c0.firebaseapp.com",
  projectId: "tuskware-493c0",
  storageBucket: "tuskware-493c0.firebasestorage.app",
  messagingSenderId: "848798919847",
  appId: "1:848798919847:web:a6d2a4496fbbc7dff37f82"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db };