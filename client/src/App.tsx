import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './screens/Dashboard/Dashboard';
import Timetable from './screens/Timetable/Timetable';
import Signin from './screens/Signin/Signin';
import Navigation from './Components/Navigation/Navigation';
import './App.css';
import ForgotPassword from './screens/ForgotPassword/ForgotPassword';
import Footer from "./Components/Footer/Footer";


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Timetable timetableData={[]} />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/forgot" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;

/*
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
        analytics.logEvent("login", { method: "Google" }); // Log login event
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
        <p>{user ? `Welcome, ${user.displayName}!` : "Please sign in."}</p>
        <button onClick={signInWithGoogle}>Sign In with Google</button>

        <img src={myIcon} alt="My Icon" />

        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
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
*/
