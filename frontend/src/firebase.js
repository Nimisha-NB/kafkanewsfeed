// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfK5YkpRPelWm6AhX28FKHEey7TYkyHqc",
  authDomain: "kafka-news.firebaseapp.com",
  projectId: "kafka-news",
  storageBucket: "kafka-news.firebasestorage.app",
  messagingSenderId: "63665553531",
  appId: "1:63665553531:web:0fcfc2a9b18c3cbfff62de",
  measurementId: "G-0E35775F19",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);

export { auth };
