import React, { useState } from "react";
import { motion } from "framer-motion"; // Import motion
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../Components/ui/card";
import { Label } from "../../Components/ui/label";
import { Button } from "../../Components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../Components/ui/tabs";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { Calendar } from "../../Components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../Components/ui/popover";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, delay: 0.5, ease: [0, 0.71, 0.2, 1.01] },
  },
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [date, setDate] = React.useState<Date>();

  return (
    <div className="dashboard-container p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-modra text-3xl font-bold">Dashboard</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-oranzna-700" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              className="text-oranzna-700"
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="inline-block bg-gray-100 p-2 rounded-lg mb-6">
        {" "}
        {/* Adjusted padding for equal margins */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex">
            <TabsTrigger
              value="overview"
              className={`tab ${
                activeTab === "overview" ? "bg-white shadow" : "text-gray-500"
              } px-4 py-2 rounded-lg transition-all duration-300 ease-in-out`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className={`tab ${
                activeTab === "analytics" ? "bg-white shadow" : "text-gray-500"
              } px-4 py-2 rounded-lg transition-all duration-300 ease-in-out`}
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className={`tab ${
                activeTab === "reports" ? "bg-white shadow" : "text-gray-500"
              } px-4 py-2 rounded-lg transition-all duration-300 ease-in-out`}
            >
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className={`tab ${
                activeTab === "notifications"
                  ? "bg-white shadow"
                  : "text-gray-500"
              } px-4 py-2 rounded-lg transition-all duration-300 ease-in-out`}
            >
              Notifications
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="col-span-1 border border-gray-200 bg-white rounded-lg shadow-sm p-6">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Label className="text-sm font-medium text-modra">
                Total Revenue
              </Label>
              <h2 className="text-3xl font-semibold mt-2">$45,231.89</h2>
              <Label className="text-sm font-medium text-green-500 mt-1">
                +20.1% from last month
              </Label>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="col-span-1 border border-gray-200 bg-white rounded-lg shadow-sm p-6">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Label className="text-sm font-medium text-modra">
                Subscriptions
              </Label>
              <h2 className="text-3xl font-semibold mt-2">+2350</h2>
              <Label className="text-sm font-medium text-green-500 mt-1">
                +18.0% from last month
              </Label>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="col-span-1 border border-gray-200 bg-white rounded-lg shadow-sm p-6">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Label className="text-sm font-medium text-modra">Sales</Label>
              <h2 className="text-3xl font-semibold mt-2">+12,234</h2>
              <Label className="text-sm font-medium text-green-500 mt-1">
                +19% from last month
              </Label>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card className="col-span-2 border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-4">
            <h2 className="text-lg font-semibold text-modra">Overview</h2>
          </CardHeader>
          <CardContent className="p-6">
            {/* Insert chart component */}
          </CardContent>
        </Card>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="col-span-1 border border-gray-200 bg-white rounded-lg shadow-sm">
            <CardHeader className="px-6 py-4">
              <h2 className="text-lg font-semibold text-modra">Recent Sales</h2>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Replace with a list of sales */}
              <div className="sale-item flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-600">
                  Olivia Martin
                </Label>
                <span className="text-sm font-medium text-gray-900">
                  $1,999.00
                </span>
              </div>
              {/* Repeat for each sale */}
              {/* Add additional sale items here */}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
