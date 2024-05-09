import React, { useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../../Config/firebase";

const ForgotPassword: React.FC = () => {
    const [sending, setSending] = useState<boolean>(false);
    const [sent, setSent] = useState<boolean>(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const resetPasswordRequest = () => {

        setSending(true);

        auth.sendPasswordResetEmail(email)
            .then(() => {
                console.log('Sent.');
                setSent(true);
                setSending(false);
            })
            .catch((error: { message: React.SetStateAction<string> }) => {
                console.log(error);
                setSending(false);
            });
    };

    return (
        <div className="min-h-screen bg-gray-900 flex justify-center items-center">
            <div className="container mx-auto px-16 py-6 flex flex-wrap justify-between items-center">
                <div className="w-full md:w-1/2">
                    <Card className="bg-transparent border-none">
                        <CardContent className="text-white p-8">
                            <h2 className="text-3xl font-semibold mb-4">ClockWise</h2>
                            <blockquote>
                                <p className="italic">
                                    "This library has saved me countless hours of work and helped
                                    me deliver stunning designs to my clients faster than ever
                                    before."
                                </p>
                                <footer className="mt-4"></footer>
                            </blockquote>
                        </CardContent>
                    </Card>
                </div>
                {sent ? (
                    <div><h2 className="text-xl font-semibold mb-6 text-center">Check your mail.</h2><p className="text-center">We have sent a password recover instructions to your email.</p></div>
                ) : (
                    <>
                        <div className="w-full md:w-1/2 max-w-md">
                            <Card className="shadow-2xl rounded-lg">
                                <CardContent className="p-8">
                                    <h2 className="text-xl font-semibold mb-6">Enter your email</h2>
                                    <form onSubmit={resetPasswordRequest} className="space-y-6">
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

                                        <Button
                                            type="submit"
                                            className="w-full bg-oranzna hover:bg-oranzna-700 text-white font-bold py-2 px-4 rounded-lg"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Loading..." : "Submit"}
                                        </Button>

                                    </form>{" "}

                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
