import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import CustomModal from "../../Components/Modal/CustomModal";
import { Dayjs } from "dayjs";
import axios from "axios";
import Admin from "./Admin";
import Referat from "./Referat";
import { Card } from "../../Components/ui/card"; // Import Shadcn Card component
import { Button } from "../../Components/ui/button"; // Import Shadcn Button component
import GenerateModal from "../../Components/Modal/GenerateModal"; // Import GenerateModal

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
  facultyId: string | null;
  isVerified: boolean | null;
}

const Dashboard: React.FC<DashboardProps> = ({
  isAuthenticated,
  uid,
  role,
  facultyId,
  isVerified
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "add">("add");

  const fetchTimetable = async () => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const credentials = window.btoa(`${username}:${password}`);
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

  return (
    <div className="dashboard-container p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-modra text-3xl font-bold">Dashboard</h1>
      </div>
      {isAuthenticated && role !== "Referat" && role !== "Admin" && (
        <Card className="mt-4 w-full bg-white rounded-lg p-4">
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
        </Card>
      )}
      {isAuthenticated && role === "Referat" && isVerified && (
        <div>
          <Card className="bg-modra w-full p-4">
            <Referat facultyId={facultyId} isVerified={isVerified} />
          </Card>
          <GenerateModal uid={uid!} />
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
      {!isVerified && role === 'Referat' && (
        <div className="flex flex-col items-center pt-40">
          <p className="text-xl text-center font-bold mb-2">
            <h2 className="text-modra text-3xl font-bold">
              You are not verified yet!
            </h2>
          </p>
          <p className="text-center text-gray-700 mb-4">
            Wait and try later ...
          </p>
        </div>
      )}
      {isAuthenticated && role === "Admin" && <Admin />}
      <CustomModal
        isOpen={open}
        toggle={handleCloseModal}
        mode={mode}
        event={selectedEvent}
        role={role}
        selectedFacultyId=""
        branchId=""
        programId=""
      />
    </div>
  );
};

export default Dashboard;
