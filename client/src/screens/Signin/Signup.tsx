import React, { useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { auth, Providers } from '../../Config/firebase';
import axios from "axios";
import { Buffer } from "buffer";

interface SignunProps {
    onSignin: () => void;
    toggleForm: () => void;
}

const Signup: React.FC<SignunProps> = ({ onSignin, toggleForm }) => {
    const [authenticating, setAuthenticating] = useState<boolean>(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };


    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        setAuthenticating(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setAuthenticating(false);
            setPassword('');
            setConfirmPassword('');
            return;
        }

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
                const result = await auth.createUserWithEmailAndPassword(email, password);
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
            setError("An error occurred with sign-up. Please try again.");
            console.error("Sign-up error: ", error);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setAuthenticating(false);
        } finally {
            setIsLoading(false);
            setAuthenticating(false);
        }
    };

    return (
        <div className="w-full md:w-1/2 max-w-md">
            <Card className="shadow-2xl rounded-lg">
                <CardContent className="p-8">
                    <h2 className="text-xl font-semibold mb-6">Sign Up</h2>
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
                        <div>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                placeholder="Confirm Password"
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
                            {authenticating ? "Authenticating..." : "Sign Up"}
                        </Button>
                    </form>{" "}
                    <p className="mt-4 text-center">
                        Already have an account?{" "}
                        <a onClick={toggleForm} className="text-oranzna hover:text-modra">Sign in</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signup;