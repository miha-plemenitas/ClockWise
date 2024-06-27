import React, { useState, useEffect, useRef } from "react";
import { Sheet, SheetTrigger, SheetContent } from "../../Components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback, } from "../../Components/ui/avatar";
import { Switch } from "../../Components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, } from "../../Components/ui/select";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import axios from "axios";
import { Buffer } from "buffer";

interface CustomizeProps {
  userName: string;
  userEmail: string;
  userPhotoURL: string;
  handleLogout: () => void;
  getInitials: (name: string, email: string) => string;
  uid: string | null;
  role: string;
}

const Customize: React.FC<CustomizeProps> = ({ userName, userEmail, userPhotoURL, handleLogout, getInitials, uid, role }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [switchStates, setSwitchStates] = useState({
    switch1: false,
    switch2: false,
    switch3: false,
    switch4: false,
    switch5: false,
  });
  const [selectValue, setSelectValue] = useState<string>(role);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | ''>('');

  useEffect(() => {
    if (role) {
      setSelectValue(role);
    }
  }, [role]);

  // Load states from localStorage on mount
  useEffect(() => {
    const savedSwitchStates = localStorage.getItem("switchStates");
    if (savedSwitchStates) {
      setSwitchStates(JSON.parse(savedSwitchStates));
    }

  }, []);

  // Save states to localStorage on change
  useEffect(() => {
    localStorage.setItem("switchStates", JSON.stringify(switchStates));
  }, [switchStates]);

  const toggleSheet = () => {
    setIsSheetOpen(!isSheetOpen);
  };

  const handleSwitchChange = (switchId: keyof typeof switchStates) => {
    setSwitchStates((prevState) => ({
      ...prevState,
      [switchId]: !prevState[switchId],
    }));
  };

  const updateRole = async () => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const response = await axios.put("https://europe-west3-pameten-urnik.cloudfunctions.net/user-update",
        { uid: uid, role: selectValue },
        { headers: headers }
      );
    } catch (error: any) {
      console.error("Error updating role:", error);
    }
  }

  useEffect(() => {
    if (selectValue != role && selectValue == 'Student') {
      updateRole();
    }
  }, [selectValue]);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSendVerificationEmail = async () => {
    const email = emailInputRef.current?.value;

    try {
      setVerificationStatus('pending');

      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post("https://europe-west3-pameten-urnik.cloudfunctions.net/user-verify",
        { uid: uid, email: email },
        { headers: headers }
      );

      if (response.data.success) {
        updateRole();
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
      }
    } catch (error: any) {
      setVerificationStatus('error');
      console.error("Error fetching data:", error);
    }
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
            <button onClick={handleLogout} className="text-sm font-medium text-orange-600 hover:text-orange-800">
              Sign Out
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Customize;
