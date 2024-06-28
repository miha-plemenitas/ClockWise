import React, { useState } from "react";
import { Sheet, SheetTrigger, SheetContent } from "../../Components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback, } from "../../Components/ui/avatar";

interface CustomizeProps {
  userName: string;
  userEmail: string;
  userPhotoURL: string;
  handleLogout: () => void;
  getInitials: (name: string, email: string) => string;
  role: string;
}

const Customize: React.FC<CustomizeProps> = ({
  userName,
  userEmail,
  userPhotoURL,
  handleLogout,
  getInitials,
  role,
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
      <SheetContent className="p-6 bg-white shadow-md rounded-lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">User Settings</h2>
            <p className="mt-1 text-sm text-gray-500">{userEmail}</p>
          </div>
          <div className="border-t border-gray-200"></div>
          <div className="space-y-2">
            <h3 className="text-md font-semibold">Assigned Role</h3>
            <p className="mt-1 text-sm text-gray-500">{role}</p>

          </div>
          <div className="border-t border-gray-200"></div>
          <div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-orange-600 hover:text-orange-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Customize;
