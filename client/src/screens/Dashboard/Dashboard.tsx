import React, { useState } from "react";
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="dashboard-container p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

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
        <Card className="col-span-1">
          <CardContent>
            <Label>Total Revenue</Label>
            <h2>$45,231.89</h2>
            <Label>+20.1% from last month</Label>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent>
            <Label>Subscriptions</Label>
            <h2>+2350</h2>
            <Label>+18.0% from last month</Label>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent>
            <Label>Sales</Label>
            <h2>+12,234</h2>
            <Label>+19% from last month</Label>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card className="col-span-2">
          <CardHeader>
            <h2>Overview</h2>
          </CardHeader>
          <CardContent>{/* Insert chart component */}</CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <h2>Recent Sales</h2>
          </CardHeader>
          <CardContent>
            {/* Replace with a list of sales */}
            <div className="sale-item">
              <Label>Olivia Martin</Label>
              <span>$1,999.00</span>
            </div>
            {/* Repeat for each sale */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
