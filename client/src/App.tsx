import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./screens/Dashboard/Dashboard";
import Timetable from "./screens/Timetable/Timetable";
import Signin from "./screens/Signin/Signin";
import Navigation from "./Components/Navigation/Navigation";
import "./App.css";
import TutorTimetable from "./screens/Timetable/TutorTimetable";
import { useEffect, useState } from "react";
import { auth } from "./Config/firebase";
import axios from "axios";
import { Buffer } from "buffer";
import { ToastProvider } from "src/Components/ui/toast";
import { Toaster } from "src/Components/ui/toaster";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const fetchUserRole = async () => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/user-get",
        {
          params: { uid },
          headers: headers,
        }
      );
      setRole(response.data.result.role);
      setFacultyId(response.data.result.facultyId);
      setName(response.data.result.name);
      setIsVerified(response.data.result.isVerified);
      console.log(response.data.result.isVerified)
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

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

  useEffect(() => {
    if (isAuthenticated && uid) {
      fetchUserRole();
    }
  }, [uid]);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleSignin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      <ToastProvider>
        <BrowserRouter>
          <Navigation
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            role={role}
          />
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  facultyId={facultyId}
                  isAuthenticated={isAuthenticated}
                  uid={uid}
                  role={role}
                  isVerified={isVerified}
                />
              }
            />
            <Route
              path="/"
              element={
                <Timetable
                  isAuthenticated={isAuthenticated}
                  uid={uid}
                  role={role}
                  facultyId={facultyId}
                  name={name}
                  isVerified={isVerified}
                />
              }
            />
            <Route
              path="/signin"
              element={<Signin onSignin={handleSignin} />}
            />
            <Route
              path="/tutortimetable"
              element={
                <TutorTimetable
                  isAuthenticated={isAuthenticated}
                  uid={uid}
                  role={role}
                  name={name}
                  isVerified={isVerified}
                />
              }
            />{" "}
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ToastProvider>
    </div>
  );
};

export default App;
