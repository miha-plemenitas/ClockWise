import React, { useState, useEffect } from "react";
import { Sheet, SheetTrigger, SheetContent } from "../../Components/ui/sheet";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../Components/ui/avatar";
import { Switch } from "../../Components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../../Components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../Components/ui/radio-group";

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
  const [switchStates, setSwitchStates] = useState({
    switch1: false,
    switch2: false,
    switch3: false,
    switch4: false,
    switch5: false,
  });
  const [selectValue, setSelectValue] = useState("option1");
  const [radioValue, setRadioValue] = useState("option1");

  // Load states from localStorage on mount
  useEffect(() => {
    const savedSwitchStates = localStorage.getItem("switchStates");
    if (savedSwitchStates) {
      setSwitchStates(JSON.parse(savedSwitchStates));
    }
    const savedSelectValue = localStorage.getItem("selectValue");
    if (savedSelectValue) {
      setSelectValue(savedSelectValue);
    }
    const savedRadioValue = localStorage.getItem("radioValue");
    if (savedRadioValue) {
      setRadioValue(savedRadioValue);
    }
  }, []);

  // Save states to localStorage on change
  useEffect(() => {
    localStorage.setItem("switchStates", JSON.stringify(switchStates));
  }, [switchStates]);

  useEffect(() => {
    localStorage.setItem("selectValue", selectValue);
  }, [selectValue]);

  useEffect(() => {
    localStorage.setItem("radioValue", radioValue);
  }, [radioValue]);

  const toggleSheet = () => {
    setIsSheetOpen(!isSheetOpen);
  };

  const handleSwitchChange = (switchId: keyof typeof switchStates) => {
    setSwitchStates((prevState) => ({
      ...prevState,
      [switchId]: !prevState[switchId],
    }));
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
          <div className="space-y-4">
            <div className="flex items-center">
              <Switch
                id="switch1"
                checked={switchStates.switch1}
                onCheckedChange={() => handleSwitchChange("switch1")}
              />
              <label
                htmlFor="switch1"
                className="ml-3 text-sm font-medium text-gray-700"
              >
                Switch 1
              </label>
            </div>
            <div className="flex items-center">
              <Switch
                id="switch2"
                checked={switchStates.switch2}
                onCheckedChange={() => handleSwitchChange("switch2")}
              />
              <label
                htmlFor="switch2"
                className="ml-3 text-sm font-medium text-gray-700"
              >
                Switch 2
              </label>
            </div>
            <div className="flex items-center">
              <Switch
                id="switch3"
                checked={switchStates.switch3}
                onCheckedChange={() => handleSwitchChange("switch3")}
              />
              <label
                htmlFor="switch3"
                className="ml-3 text-sm font-medium text-gray-700"
              >
                Switch 3
              </label>
            </div>
            <div className="flex items-center">
              <Switch
                id="switch4"
                checked={switchStates.switch4}
                onCheckedChange={() => handleSwitchChange("switch4")}
              />
              <label
                htmlFor="switch4"
                className="ml-3 text-sm font-medium text-gray-700"
              >
                Switch 4
              </label>
            </div>
            <div className="flex items-center">
              <Switch
                id="switch5"
                checked={switchStates.switch5}
                onCheckedChange={() => handleSwitchChange("switch5")}
              />
              <label
                htmlFor="switch5"
                className="ml-3 text-sm font-medium text-gray-700"
              >
                Switch 5
              </label>
            </div>
          </div>
          <div className="border-t border-gray-200"></div>
          <div className="space-y-2">
            <h3 className="text-md font-semibold">Select an Option</h3>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger className="w-full mt-1 text-sm">
                {selectValue}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border-t border-gray-200"></div>
          <div className="space-y-2">
            <h3 className="text-md font-semibold">Select a Radio Option</h3>
            <RadioGroup
              value={radioValue}
              onValueChange={setRadioValue}
              className="mt-1 space-y-2"
            >
              <div className="flex items-center">
                <RadioGroupItem value="option1" id="radio1" />
                <label
                  htmlFor="radio1"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Option 1
                </label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="option2" id="radio2" />
                <label
                  htmlFor="radio2"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Option 2
                </label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="option3" id="radio3" />
                <label
                  htmlFor="radio3"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Option 3
                </label>
              </div>
            </RadioGroup>
          </div>
          <div className="border-t border-gray-200"></div>
          <div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:text-red-800"
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
