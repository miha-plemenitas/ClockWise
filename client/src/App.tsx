import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./screens/Dashboard/Dashboard";
import Timetable from "./screens/Timetable/Timetable";
import Signin from "./screens/Signin/Signin";
import Navigation from "./Components/Navigation/Navigation";
import "./App.css";
import ForgotPassword from "./screens/ForgotPassword/ForgotPassword";
import { useEffect, useState } from "react";
import { auth } from "./Config/firebase";
import axios from "axios";
import { Buffer } from "buffer";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setUid(user.uid);
      } else {
        setIsAuthenticated(false);
        setUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleSignin = () => {
    setIsAuthenticated(true);
  };

  const login = async (): Promise<void> => { 
    const username = process.env.REACT_APP_USERNAME;
    const password = process.env.REACT_APP_PASSWORD;

    const bufferedCredentials = Buffer.from(`${username}:${password}`);
    const credentials = bufferedCredentials.toString("base64");
    const headers = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await axios.post(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/auth-login",
        { uid: username },
        { headers: headers, withCredentials: true }
      );

      console.log("Login successful", response);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }

  return (
    <div>
      <BrowserRouter>
        <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Timetable isAuthenticated={isAuthenticated} uid={uid} login={login} />} />
          <Route path="/signin" element={<Signin onSignin={handleSignin} login={login} />} />
          <Route path="/forgot" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
