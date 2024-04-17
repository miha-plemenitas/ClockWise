import React, { useEffect, useState } from "react";
import { auth, Providers, analytics } from "./Config/firebase"; // adjust path as necessary
import logo from "./logo.svg";
import "./App.css";

interface IUser {
  displayName: string | null;
  email: string | null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const newUser: IUser = {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
        };
        setUser(newUser);
        analytics.logEvent('login', { method: 'Google' }); // Log login event
        console.log("Logged in user:", newUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await auth.signInWithPopup(Providers.google);
      console.log("Successful sign-in:", result.user);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {user ? `Welcome, ${user.displayName}!` : "Please sign in."}
        </p>
        <button onClick={signInWithGoogle}>Sign In with Google</button>
        <p>Edit <code>src/App.tsx</code> and save to reload.</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
};

export default App;