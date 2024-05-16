import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "../ui/navigation-menu";
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      onLogout();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out: ", error);
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
      </NavigationMenuList>
      <NavigationMenuList className="flex items-center">
        {isAuthenticated ? (
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className="text-red-600"
              onClick={handleLogout}
            >
              Sign Out
            </NavigationMenuTrigger>
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
