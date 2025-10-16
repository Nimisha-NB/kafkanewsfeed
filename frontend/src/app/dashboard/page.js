"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Track current logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/"); // redirect to login if not logged in
      }
    });
    return () => unsubscribe();
  }, []);

  // Logout function
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); // go back to login page
  };

  if (!user) return <p>Loading...</p>;

  return (
    <main style={{ padding: 40 }}>
      <h1>Welcome, {user.email}!</h1>
      <button onClick={handleLogout} style={{ marginTop: 20 }}>
        Logout
      </button>
    </main>
  );
}
