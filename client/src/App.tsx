import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./screens/Dashboard/Dashboard";
import Timetable from "./screens/Timetable/Timetable";
import Signin from "./screens/Signin/Signin";
import Navigation from "./Components/Navigation/Navigation";
import "./App.css";
import ForgotPassword from "./screens/ForgotPassword/ForgotPassword";
import { useEffect, useState } from "react";
import { auth } from "./Config/firebase";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleSignin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      <BrowserRouter>
        <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Timetable timetableData={[]} />} />
          <Route path="/signin" element={<Signin onSignin={handleSignin} />} />
          <Route path="/forgot" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
