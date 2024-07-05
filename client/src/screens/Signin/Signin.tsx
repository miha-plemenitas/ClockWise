import React, { useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { useNavigate } from 'react-router-dom';
import { auth, Providers } from '../../Config/firebase';
import axios from "axios";
import { Buffer } from "buffer";
import Signup from "./Signup";

interface SigninProps {
  onSignin: () => void;
}

const Signin: React.FC<SigninProps> = ({ onSignin }) => {
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignin, setIsSignin] = useState(true);
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };


  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setAuthenticating(true);
    setError(null);

    try {

      const username = process.env.REACT_APP_USERNAME;
      const pass = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${pass}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      if (email && password) {
        const result = await auth.signInWithEmailAndPassword(email, password);
        const user = result.user;
        console.log(user);

        if (user) {
          const uid = user.uid;
          try {
            const response = await axios.post("https://europe-west3-pameten-urnik.cloudfunctions.net/user-add",
              { uid, email },
              { headers: headers }
            );
            console.log('Response:', response.data);
          } catch (error: any) {
            console.error("Error fetching data:", error);
          }

          onSignin();
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setError("An error occurred with sign-in. Please try again.");
      console.error("Sign-in error: ", error);
      setEmail('');
      setPassword('');
      setAuthenticating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const result = await auth.signInWithPopup(Providers.google);
      const user = result.user;
      if (user) {
        const { uid, email } = user;
        try {
          const response = await axios.post("https://europe-west3-pameten-urnik.cloudfunctions.net/user-add",
            { uid, email },
            { headers: headers }
          );
        } catch (error: any) {
          console.error("Error fetching data:", error);
        }
        onSignin();
        navigate('/');
      }
    } catch (error) {
      setError("An error occurred with Google sign-in. Please try again.");
      console.error("Google sign-in error: ", error);
    }
  };

  const toggleForm = () => {
    setIsSignin(!isSignin);
  }

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center">
      <div className="container mx-auto px-16 py-6 flex flex-wrap justify-between items-center">
        <div className="w-full md:w-1/2">
          <Card className="bg-transparent border-none">
            <CardContent className="text-white p-8">
              <h2 className="text-3xl font-semibold mb-4">ClockWise</h2>
              <blockquote>
                <p className="italic">
                  "Master Your Time, Achieve Your Goals."
                </p>
                <footer className="mt-4"></footer>
              </blockquote>
            </CardContent>
          </Card>
        </div>
        {isSignin ? (<div className="w-full md:w-1/2 max-w-md">
          <Card className="shadow-2xl rounded-lg">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-6">Sign In</h2>
              {error && (
                <div className="mb-4 text-red-500 text-left">
                  {error}
                </div>
              )}
              <form className="space-y-6">
                <div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Email"
                    className="w-full px-4 py-2 rounded-lg border-gray-300"
                    required
                  />
                </div>
                <div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    className="w-full px-4 py-2 rounded-lg border-gray-300"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-modra hover:bg-modra-700 text-white font-bold py-2 px-4 rounded-lg"
                  disabled={isLoading}
                  onClick={handleSubmit}
                >
                  {authenticating ? "Authenticating..." : "Sign In"}
                </Button>
              </form>{" "}
              <p className="mt-4 text-center">
                Don't have an account?{" "}
                <a onClick={toggleForm} className="text-oranzna hover:text-modra">Sign up</a>
                <div className="my-4 text-center">or sign in with</div>
              </p>
              <div className="flex space-x-2">
                <Button className="flex-1 bg-oranzna hover:bg-oranzna-700 text-white font-bold py-2 px-4 rounded-lg" onClick={signInWithGoogle}>
                  Google
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>) : (<Signup onSignin={onSignin} toggleForm={toggleForm}/>)}
      </div>
    </div>
  );
};

export default Signin;

