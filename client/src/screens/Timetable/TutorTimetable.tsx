import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import CustomModal from "../../Components/Modal/CustomModal";
import { Dayjs } from "dayjs";
import { Buffer } from "buffer";

import DropdownMenuFaculties from "../../Components/Dropdowns/DropdownMenuFaculties";
import DropdownMenuTutors from "../../Components/Dropdowns/DropdownMenuTutors";

import useFaculties from "../../Components/Hooks/useFaculties";
import useTutors from "../../Components/Hooks/useTutors";
import useRooms from "../../Components/Hooks/useRooms";
import useGroups from "../../Components/Hooks/useGroups";
import axios from "axios";
import SaveButton from "../../Components/SaveButton/SaveButton";
import { Switch } from "../../Components/ui/switch"; // Import Switch component

interface TutorTimetableProps {
  isAuthenticated: boolean;
  uid: string | null;
  role: string;
  name: string | null;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    date: Dayjs;
    executionType: string;
    executionTypeId: string;
    groups: { name: string; id: string }[];
    tutors: { name: string; id: string }[];
    rooms: { name: string; id: string }[];
    branches: { name: string; id: string }[];
    group_ids: number[];
    tutor_ids: number[];
    branch_ids: number[];
    room_ids: number[];
    editable: boolean;
    lecture: boolean;
    hasRooms: boolean;
  };
}

interface CustomEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    tutors?: { name: string; id: string }[];
    notes: string;
    editable: boolean;
    lecture: boolean;
  };
}

const TutorTimetable: React.FC<TutorTimetableProps> = ({ isAuthenticated, uid, role, name }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "add">("add");
  const calendarRef = useRef<FullCalendar>(null);
  const [isTutorMode, setIsTutorMode] = useState(true); // State to track switch

  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    localStorage.getItem("selectedFacultyId") || '');
  const [selectedTutors, setSelectedTutors] = useState<
    { id: string; name: string }[]
  >(JSON.parse(localStorage.getItem("selectedTutors") || "[]"));

  const { faculties } = useFaculties();
  const { tutors } = useTutors(selectedFacultyId || "");
  const { rooms } = useRooms(selectedFacultyId || "");
  const { groups } = useGroups(selectedFacultyId || "", "");

  const tutorMap: Record<string, string> = tutors.reduce((acc, tutor) => {
    acc[tutor.tutorId] = `${tutor.firstName} ${tutor.lastName}`;
    return acc;
  }, {} as Record<string, string>);

  const roomMap: Record<string, string> = rooms.reduce((acc, room) => {
    acc[room.id] = room.roomName;
    return acc;
  }, {} as Record<string, string>);

  const groupMap: Record<string, string> = groups.reduce((acc, group) => {
    acc[group.id] = group.name;
    return acc;
  }, {} as Record<string, string>);

  const fetchOnce = useRef(false);

  const fetchData = useCallback(async () => {
    if (!selectedFacultyId || selectedTutors.length === 0) return;
    if (fetchOnce.current) return;
    fetchOnce.current = true;

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
        "https://europe-west3-pameten-urnik.cloudfunctions.net/lecture-getAllForTutor",
        {
          params: {
            facultyId: selectedFacultyId,
            tutorId: selectedTutors[0].id,
            startTime: "2023-10-01T00:00:00Z",
            endTime: "2024-06-14T23:59:59Z",
          },
          headers: headers,
        }
      );

      const formattedEvents: Event[] = response.data.result.map(
        (lecture: any) => {
          const startTime = new Date(lecture.startTime._seconds * 1000);
          const formattedStart = startTime.toISOString().slice(0, 19);

          const endTime = new Date(lecture.endTime._seconds * 1000);
          const formattedEnd = endTime.toISOString().slice(0, 19);

          return {
            id: lecture.id,
            title: lecture.course,
            start: formattedStart,
            end: formattedEnd,
            extendedProps: {
              courseId: lecture.courseId,
              duration: lecture.duration,
              executionType: lecture.executionType,
              executionTypeId: lecture.executionTypeId,
              editable: false,
              lecture: true,
              hasRooms: lecture.hasRooms,
              group_ids: lecture.group_ids,
              room_ids: lecture.room_ids,
              tutor_ids: lecture.tutor_ids,
              groups: lecture.groups,
              rooms: lecture.rooms,
              tutors: lecture.tutors,
              branch_ids: lecture.branch_ids,
              branches: lecture.branches,
            },
          };
        }
      );
      setEvents((prevEvents) => {
        // Only update events if they have changed
        if (JSON.stringify(prevEvents) !== JSON.stringify(formattedEvents)) {
          return formattedEvents;
        }
        return prevEvents;
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [selectedFacultyId, selectedTutors, tutorMap, roomMap, groupMap]);

  useEffect(() => {
    if (selectedFacultyId && selectedTutors.length > 0) {
      fetchData();
    }
  }, [selectedFacultyId, selectedTutors, fetchData]);


  const isTutorInArray = (tutorName: any, tutorsArray: any): boolean => {
    return tutorsArray.some((tutor: { name: string; }) => tutor.name.toLowerCase().includes(tutorName.toLowerCase()));
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event =
      events.find((event: Event) => event.id === clickInfo.event.id) ||
      customEvents.find(
        (event: CustomEvent) => event.id === clickInfo.event.id
      );

    console.log(event);

    if (event && event.extendedProps.lecture) {
      setSelectedEvent(event);
      setMode("view");
      setOpen(true);
    } else if (event && !event.extendedProps.lecture) {
      setSelectedEvent(event);
      setMode("edit");
      setOpen(true);
    } else {
      console.error("Event not found");
      alert("Event not found. Please try again.");
    }
  };

  const handleCloseModal = () => {
    //setSelectedEvent(null);
    setOpen(false);
  };

  const handleDateSelect = () => {
    if (isAuthenticated) {
      setMode("add");
      setOpen(true);
    }
  };

  const fetchCustomEvents = async () => {
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
        "https://europe-west3-pameten-urnik.cloudfunctions.net/event-getAll",
        {
          params: { uid },
          headers: headers,
        }
      );

      const formattedEvents: CustomEvent[] = response.data.result.map(
        (eventData: any) => {
          const startTime = new Date(eventData.startTime._seconds * 1000);
          const formattedStart = startTime.toISOString().slice(0, 19);

          const endTime = new Date(eventData.endTime._seconds * 1000);
          const formattedEnd = endTime.toISOString().slice(0, 19);

          return {
            id: eventData.id,
            title: eventData.title,
            start: formattedStart,
            end: formattedEnd,
            extendedProps: {
              notes: eventData.notes,
              editable: eventData.editable,
            },
          };
        }
      );
      setCustomEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && uid) {
      fetchCustomEvents();
    }
  }, [uid]);

  const handleAddEvent = async (eventInfo: any) => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/event-add",
        { uid, ...eventInfo },
        { headers: headers }
      );
      if (response.status === 201) {
        setOpen(false);
        fetchCustomEvents();
      }
    } catch (error: any) {
      console.error("Error adding event:", error);
    }
  };

  const handleUpdateEvent = async (eventInfo: any) => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const response = await axios.put(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/event-update",
        { uid, eventId: eventInfo.id, ...eventInfo },
        {
          headers: headers,
        }
      );
      if (response.status === 200) {
        setOpen(false);
        fetchCustomEvents();
      }
    } catch (error: any) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (eventId: any) => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const response = await axios.delete(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/event-delete",
        {
          data: { uid, eventId },
          headers: headers,
        }
      );
      if (response.status === 200) {
        setOpen(false);
        fetchCustomEvents();
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
    }
  };

  const handleUpdateLecture = (eventInfo: any) => { };

  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <>
        <b>{eventInfo.event.title}</b>
        <p>{eventInfo.event.extendedProps.location}</p>
      </>
    );
  };

  useEffect(() => {
    const storedMode = localStorage.getItem("isTutorMode");
    if (storedMode) {
      setIsTutorMode(storedMode === "true");
    }

    setSelectedFacultyId('');
    setSelectedTutors([]);
    localStorage.removeItem("selectedFacultyId");
    localStorage.removeItem("selectedTutors");


  }, []);

  useEffect(() => {
    if (!isTutorMode) {
      localStorage.setItem("isTutorMode", "false");
      navigate("/");
    } else {
      localStorage.setItem("isTutorMode", "true");
    }
  }, [isTutorMode, navigate]);

  return (
    <div className="w-full p-5">
      <h1 className="text-modra text-3xl font-bold mb-4">Tutor Timetable</h1>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex flex-col items-start space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <DropdownMenuFaculties
            onSelectFaculty={(id) => {
              setSelectedFacultyId(id);
              localStorage.setItem("selectedFacultyId", id);
            }}
            selectedFacultyName={
              faculties.find((f) => f.id === selectedFacultyId)?.name || null
            }
          />
          <DropdownMenuTutors
            facultyId={selectedFacultyId || ""}
            onSelectTutors={(tutors) => {
              setSelectedTutors(tutors);
              const selectedTutorNames = tutors.map((t) => t.name);
              const selectedTutorIds = tutors.map((t) => t.id);
              localStorage.setItem("selectedTutors", JSON.stringify(tutors));
            }}
            selectedTutorNames={selectedTutors.map((t) => t.name)}
          />
        </div>
        <div className="flex items-center">
          <label className="mr-2">Enable Tutor Timetable</label>
          <Switch checked={isTutorMode} onCheckedChange={setIsTutorMode} />
        </div>
      </div>
      <div className="mt-4 w-full bg-white rounded-lg p-4">
        <FullCalendar
          ref={calendarRef}
          height={"auto"}
          slotMinTime={"7:00"}
          slotMaxTime={"21:00"}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          weekends={false}
          eventContent={renderEventContent}
          events={[
            ...events.map((event) => ({ ...event, color: "#4890CB" })),
            ...customEvents.map((event) => ({ ...event, color: "#1B364B" })),
          ]}
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
          select={handleDateSelect}
        />
      </div>
      <div className="flex space-x-2">
        <SaveButton
          isAuthenticated={isAuthenticated}
          uid={uid}
          events={events}
        />
      </div>
      <CustomModal
        isOpen={open}
        toggle={handleCloseModal}
        mode={mode}
        onSave={handleAddEvent}
        onUpdate={handleUpdateEvent}
        onUpdateLecture={handleUpdateLecture}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        role={role}
        selectedFacultyId=""
        branchId=""
        programId=""
      />
    </div>
  );
};

export default TutorTimetable;
