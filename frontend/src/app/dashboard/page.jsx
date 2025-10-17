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
        router.push("/login"); 
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Logout function
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <main style={{ padding: 40 }}>
      <h1>Welcome, {user.email}!</h1>
      <button onClick={handleLogout} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
        Logout
      </button>
    </main>
  );
}
