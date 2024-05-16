import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "../ui/sheet";
import { Switch } from "../ui/switch";
import logo from "../../Assets/SVG_dodatno/calendar.svg";
import { useNavigate } from "react-router-dom";
import { auth } from "../../Config/firebase";

interface NavigationProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      onLogout();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleSheet = () => {
    setIsSheetOpen(!isSheetOpen);
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
      </NavigationMenuList>
      <NavigationMenuList className="flex items-center">
        {isAuthenticated ? (
          <NavigationMenuItem>
            <Sheet open={isSheetOpen} onOpenChange={toggleSheet}>
              <SheetTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src="path/to/avatar-image.jpg"
                    alt="User Avatar"
                  />
                  <AvatarFallback>PD</AvatarFallback>
                </Avatar>
              </SheetTrigger>
              <SheetContent>
                <div className="p-4">
                  <h2 className="text-lg font-bold">User Settings</h2>
                  <div className="mt-4 flex items-center">
                    <Switch id="airplane-mode" />
                    <label htmlFor="airplane-mode" className="ml-2">
                      Airplane Mode
                    </label>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sign Out
                    </button>
                  </div>
                  <SheetClose asChild>
                    <button
                      onClick={toggleSheet}
                      className="mt-4 text-gray-600 hover:text-gray-800"
                    >
                      Close
                    </button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem>
            <NavigationMenuLink href="/signin">
              <NavigationMenuTrigger className="text-green-600">
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
