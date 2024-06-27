import React, { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import Customize from "../../screens/Customize/Customize";
import logo from "../../Assets/SVG_dodatno/calendar.svg";
import { useNavigate } from "react-router-dom";
import { auth } from "../../Config/firebase";

interface NavigationProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  uid: string | null;
  role: string;
}

const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated,
  onLogout,
  uid,
  role,
}) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      const user = auth.currentUser;
      if (user) {
        const name = user.displayName || "";
        const photoURL = user.photoURL || "";
        const email = user.email || "";
        setUserName(name);
        setUserPhotoURL(photoURL);
        setUserEmail(email);
      }
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      onLogout();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("");
      return initials.toUpperCase();
    } else if (email) {
      return email[0].toUpperCase();
    } else {
      return "";
    }
  };

  return (
    <NavigationMenu className="flex justify-between items-center w-full">
      <NavigationMenuList className="flex items-center">
        <NavigationMenuItem>
          <NavigationMenuLink href="/">
            <img src={logo} className="mr-4 align-middle w-6 h-6" alt="logo" />
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/dashboard">
            <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/">
            <NavigationMenuTrigger>Timetable</NavigationMenuTrigger>
          </NavigationMenuLink>
        </NavigationMenuItem>
       {/*  {role === "Tutor" && (
          <NavigationMenuItem>
            <NavigationMenuLink href="/tutortimetable">
              <NavigationMenuTrigger>Tutor Timetable</NavigationMenuTrigger>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}*/}
      </NavigationMenuList>
      <NavigationMenuList className="flex items-center">
        {isAuthenticated ? (
          <NavigationMenuItem>
            <Customize
              userName={userName}
              userEmail={userEmail}
              userPhotoURL={userPhotoURL}
              handleLogout={handleLogout}
              getInitials={getInitials}
              uid={uid}
              role={role}
            />
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem>
            <NavigationMenuLink href="/signin">
              <NavigationMenuTrigger className="text-orange-600">
                Sign In
              </NavigationMenuTrigger>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
