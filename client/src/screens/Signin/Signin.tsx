import React, { useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { motion } from "framer-motion"; // Import motion

const cardVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, delay: 0.5, ease: [0, 0.71, 0.2, 1.01] },
  },
};

const Signin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      console.log("Email:", email);
      console.log("Password:", password);
      setIsLoading(false);
    }, 2000);
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
                <footer className="mt-4">Lojze Slak</footer>
              </blockquote>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/2 max-w-md">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="shadow-2xl rounded-lg">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-6">Sign In</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full bg-crna hover:bg-crna-700 text-white font-bold py-2 px-4 rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Sign In"}
                  </Button>
                </form>{" "}
                <div className="my-4 text-center">OR CONTINUE WITH</div>
                <Button className="w-full bg-oranzna hover:bg-oranzna-700 text-white font-bold py-2 px-4 rounded-lg">
                  Microsoft Student Account
                </Button>
                <p className="mt-4 text-xs text-center">
                  By clicking continue, you agree to our{" "}
                  <a href="#terms" className="underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#privacy" className="underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
