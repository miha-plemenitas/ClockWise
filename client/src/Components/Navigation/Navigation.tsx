import React from 'react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from '../ui/navigation-menu'; // Adjust path as necessary

const Navigation = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="/">
            <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/timetable">
            <NavigationMenuTrigger>Timetable</NavigationMenuTrigger>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/signin">
            <NavigationMenuTrigger>Sign In</NavigationMenuTrigger>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
