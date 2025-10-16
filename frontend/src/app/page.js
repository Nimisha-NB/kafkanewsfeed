"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recs, setRecs] = useState([]);

  const router = useRouter();
  // const [currentUser, setCurrentUser] = useState(null);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       console.log("Logged in user:", user.email);
  //       setCurrentUser(user);
  //     } else {
  //       console.log("No user logged in");
  //       setCurrentUser(null);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
    } catch (err) {
      console.error(err);
      alert("Signup failed!");
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      console.log(token);

      // Send token to Flask backend
      const res = await fetch(
        "http://localhost:5000/recommendations/<user_id>",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setRecs(data);
      console.log(data);
      alert("Login successful!");
      router.push("/dashboard"); // ✅ redirect to new page
    } catch (err) {
      console.error(err);
      alert("Login failed!");
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Kafka News Recommender</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup} style={{ marginLeft: 10 }}>
        Signup
      </button>
      {/* 
      {recs.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Your Recommendations:</h3>
          <ul>
            {recs.map((item, i) => (
              <li key={i}>{item.title}</li>
            ))}
          </ul>
        </div>
      )} */}
    </main>
  );
}
