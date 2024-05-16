import React, { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "../../Components/ui/sheet";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../Components/ui/avatar";
import { Switch } from "../../Components/ui/switch";
import { auth } from "../../Config/firebase";

interface CustomizeProps {
  userName: string;
  userEmail: string;
  userPhotoURL: string;
  handleLogout: () => void;
  getInitials: (name: string, email: string) => string;
}

const Customize: React.FC<CustomizeProps> = ({
  userName,
  userEmail,
  userPhotoURL,
  handleLogout,
  getInitials,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const toggleSheet = () => {
    setIsSheetOpen(!isSheetOpen);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={toggleSheet}>
      <SheetTrigger asChild>
        <Avatar className="cursor-pointer">
          {userPhotoURL ? (
            <AvatarImage src={userPhotoURL} alt="User Avatar" />
          ) : (
            <AvatarFallback>{getInitials(userName, userEmail)}</AvatarFallback>
          )}
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
  );
};

export default Customize;
