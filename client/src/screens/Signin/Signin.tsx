import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Button } from "../../Components/ui/button";

const Signin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    // Adjusting the width and adding rounding to the card
    <Card className="w-[350px] mx-auto mt-20 shadow-lg rounded-lg">
      <CardHeader className="bg-gray-100 p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Sign In</h2>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end p-4 rounded-b-lg">
        <Button
          type="submit"
          className="bg-oranzna hover:bg-oranzna-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign In
        </Button>{" "}
      </CardFooter>
    </Card>
  );
};

export default Signin;
