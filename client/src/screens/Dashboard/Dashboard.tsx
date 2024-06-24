import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import CustomModal from "../../Components/Modal/CustomModal";
import HeatmapModal from "../../Components/Modal/HeatmapModal";
import { Dayjs } from "dayjs";
import { Buffer } from "buffer";
import axios from "axios";
import { Button } from "../../Components/ui/button";
import Plot from "react-plotly.js";
import CircularProgress from "@mui/material/CircularProgress"; // Import the loading spinner
import { Card } from "../../Components/ui/card"; // Import Card component from the specified path

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <>
      <p>{eventInfo.event.title}</p>
      <p>{eventInfo.event.extendedProps.location}</p>
    </>
  );
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    date: Dayjs;
    type: string;
    groups: string;
    teacher: string;
    location: string;
    editable: boolean;
  };
}

interface DashboardProps {
  isAuthenticated: boolean;
  uid: string | null;
  role: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  isAuthenticated,
  uid,
  role,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "add">("add");
  const [heatmapModalOpen, setHeatmapModalOpen] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false); // Add loading state for heatmap

  const fetchTimetable = async () => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/timetable-get",
        {
          params: { uid: uid },
          headers,
        }
      );
      setEvents(response.data.result.events);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && uid) {
      fetchTimetable();
    }
  }, [uid]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(
      (event: Event) => event.id === clickInfo.event.id
    );

    if (event) {
      setSelectedEvent(event);
      setMode("view");
      setOpen(true);
    } else {
      console.error("Event not found");
      alert("Event not found. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setOpen(false);
  };

  const handleOpenHeatmapModal = () => {
    setHeatmapModalOpen(true);
  };

  const handleCloseHeatmapModal = () => {
    setHeatmapModalOpen(false);
  };

  const handleGenerateHeatmap = async (generateData: any) => {
    setLoadingHeatmap(true); // Start loading
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };
      const { selectedFaculty, selectedCollection, selectedType } =
        generateData;
      const response = await axios.get(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/schedule-heatMap",
        {
          params: {
            facultyId: selectedFaculty,
            collection: selectedCollection,
            type: selectedType,
          },
          headers,
        }
      );

      setHeatmapData(response.data.result);
      setHeatmapModalOpen(false);
      console.log("Heatmap data:", response.data.result);
    } catch (error) {
      console.error("Error generating heatmap:", error);
    } finally {
      setLoadingHeatmap(false); // Stop loading
    }
  };

  const prepareHeatmapData = (heatmapData: any) => {
    const days = Object.keys(heatmapData);
    const hours = Object.keys(heatmapData[days[0]]);

    const x = hours;
    const y = days;
    const z = y.map((day) => x.map((hour) => heatmapData[day][hour]));

    return { x, y, z };
  };

  return (
    <div className="dashboard-container p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-modra text-3xl font-bold">Dashboard</h1>
      </div>
      {isAuthenticated && role !== "Referat" && (
        <div>
          <div className="mt-4 w-full bg-white rounded-lg p-4">
            <FullCalendar
              height={"auto"}
              slotMinTime={"7:00"}
              slotMaxTime={"21:00"}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              weekends={false}
              eventContent={renderEventContent}
              eventSources={[{ events: events, color: "#4890CB" }]}
              headerToolbar={{
                left: "title",
                center: "",
                right: "prev,next today",
              }}
              titleFormat={{ year: "numeric", month: "short", day: "numeric" }}
              dayHeaderClassNames="font-bold text-lg"
              dayHeaderFormat={{
                weekday: "short",
                month: "short",
                day: "numeric",
              }}
              selectable={true}
              selectMirror={true}
              unselectAuto={true}
              eventClick={handleEventClick}
            />
          </div>
          <CustomModal
            isOpen={open}
            toggle={handleCloseModal}
            mode={mode}
            event={selectedEvent}
            role={role}
          />
        </div>
      )}
      {isAuthenticated && role === "Referat" && (
        <div>
          <HeatmapModal
            isOpen={heatmapModalOpen}
            toggle={handleCloseHeatmapModal}
            onGenerate={handleGenerateHeatmap}
          />
          <Button
            onClick={handleOpenHeatmapModal}
            className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2"
          >
            <span>Generate heatmap</span>
          </Button>
          {loadingHeatmap ? (
            <div className="flex justify-center items-center mt-4">
              <CircularProgress sx={{ color: "grey.500" }} />{" "}
              {/* Display loading spinner with grey color */}
            </div>
          ) : (
            heatmapData && (
              <Card className="mt-4 w-full bg-white rounded-lg p-4">
                {" "}
                {/* Use Card component */}
                <Plot
                  data={[
                    {
                      z: prepareHeatmapData(heatmapData).z,
                      x: prepareHeatmapData(heatmapData).x,
                      y: prepareHeatmapData(heatmapData).y,
                      type: "heatmap",
                      colorscale: "Viridis",
                    },
                  ]}
                  layout={{
                    title: "Lecture Heatmap",
                    xaxis: { title: "Hour" },
                    yaxis: { title: "Day" },
                  }}
                  style={{ width: "100%", height: "100%" }}
                />
              </Card>
            )
          )}
        </div>
      )}
      {!isAuthenticated && (
        <div className="flex flex-col items-center pt-40">
          <p className="text-xl text-center font-bold mb-2">
            <h2 className="text-modra text-3xl font-bold">
              Your Timetable Awaits!
            </h2>
          </p>
          <p className="text-center text-gray-700 mb-4">
            <a href="/signin" className="text-oranzna hover:text-modra">
              Sign in
            </a>{" "}
            to access your saved timetable and more.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
