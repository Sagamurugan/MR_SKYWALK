
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzfj0gKtKkvuOxuwQ1TyD4XaH2mb9H4r0",
  authDomain: "mr-skywalk-dashboard.firebaseapp.com",
  projectId: "mr-skywalk-dashboard",
  storageBucket: "mr-skywalk-dashboard.firebasestorage.app",
  messagingSenderId: "618243327320",
  appId: "1:618243327320:web:0a39e9856a967e28f1d12d"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);