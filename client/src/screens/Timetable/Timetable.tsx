import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import CustomModal from "../../Components/Modal/CustomModal";
import { firestore } from "../../Config/firebase";
import dayjs, { Dayjs } from "dayjs";
import { Buffer } from "buffer";

import DropdownMenuFaculties from "../../Components/Dropdowns/DropdownMenuFaculties";
import DropdownMenuPrograms from "../../Components/Dropdowns/DropdownMenuPrograms";
import DropdownMenuYear from "../../Components/Dropdowns/DropdownMenuYear";
import DropdownMenuBranches from "../../Components/Dropdowns/DropdownMenuBranches";
import DropdownMenuCourses from "../../Components/Dropdowns/DropdownMenuCourses";
import DropdownMenuGroups from "../../Components/Dropdowns/DropdownMenuGroups";
import DropdownMenuRooms from "../../Components/Dropdowns/DropdownMenuRooms";
import DropdownMenuTutors from "../../Components/Dropdowns/DropdownMenuTutors";

import useFaculties from "../../Components/Hooks/useFaculties";
import usePrograms from "../../Components/Hooks/usePrograms";
import useBranches from "../../Components/Hooks/useBranches";
import useTutors from "../../Components/Hooks/useTutors";
import useRooms from "../../Components/Hooks/useRooms";
import axios from "axios";

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <>
      <b>{eventInfo.event.title}</b>
      <p>{eventInfo.event.extendedProps.location}</p>
    </>
  );
}

interface TimetableProps {
  isAuthenticated: boolean;
  uid: string | null;
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

interface CustomEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    notes: string;
    editable: boolean;
  };
}

interface Group {
  id: string;
  branchId: number;
  programId: number;
  name: string;
}

const Timetable: React.FC<TimetableProps> = ({ isAuthenticated, uid }) => {
  // events on timetable
  const [events, setEvents] = useState<Event[]>([]);
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "add">("add");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(
    null
  );
  const calendarRef = useRef<FullCalendar>(null);

  // dropdowns
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    () => localStorage.getItem("selectedFacultyId") || ""
  );
  const [selectedFacultyName, setSelectedFacultyName] = useState<string | null>(
    null
  );
  const { faculties } = useFaculties();

  const [programId, setProgramId] = useState<string | null>(
    () => localStorage.getItem("selectedProgramId") || null
  );
  const [selectedProgramName, setSelectedProgramName] = useState<string | null>(
    null
  );
  const { programs } = usePrograms(selectedFacultyId);

  const [programDuration, setProgramDuration] = useState<number | null>(null);

  const [selectedYear, setSelectedYear] = useState<number | null>(
    () => Number(localStorage.getItem("selectedYearId")) || null
  );
  const [selectedYearName, setSelectedYearName] = useState<string | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<string | null>(
    () => localStorage.getItem("selectedBranchId") || null
  );
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(
    null
  );

  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(
    null
  );
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  const [selectedRoomName, setSelectedRoomName] = useState<string | null>(null);

  const [selectedTutorName, setSelectedTutorName] = useState<string | null>(
    null
  );

  const { branches } = useBranches(
    selectedFacultyId,
    programId || "",
    selectedYear
  );

  const fetchAllGroups = async () => {
    try {
      const querySnapshot = await firestore
        .collection("faculties")
        .doc(selectedFacultyId)
        .collection("groups")
        .get();

      const filteredGroups: Group[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];

      setAllGroups(filteredGroups);
    } catch (err) {
      console.error("Error loading groups:", err);
    }
  };

  // Use custom hooks to fetch tutor, room, and group data
  const { tutors } = useTutors(selectedFacultyId);
  const { rooms } = useRooms(selectedFacultyId);

  // Lookup maps for event info
  const tutorMap: Record<string, string> = tutors.reduce((acc, tutor) => {
    acc[tutor.tutorId] = `${tutor.firstName} ${tutor.lastName}`;
    return acc;
  }, {} as Record<string, string>);

  const roomMap: Record<string, string> = rooms.reduce((acc, room) => {
    acc[room.id] = room.roomName;
    return acc;
  }, {} as Record<string, string>);

  const groupMap: Record<string, string> = allGroups.reduce((acc, group) => {
    acc[group.id] = group.name;
    return acc;
  }, {} as Record<string, string>);

  const fetchData = async () => {
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
        "https://europe-west3-pameten-urnik.cloudfunctions.net/lecture-getAllForBranch",
        {
          params: {
            facultyId: selectedFacultyId,
            branchId: selectedBranch,
            startTime: "2023-09-01T00:00:00Z",
          },
          headers: headers,
        }
      );
      const formattedEvents: Event[] = response.data.result.map(
        (lecture: any) => {
          // Format start time
          const startTime = new Date(lecture.startTime._seconds * 1000);
          const formattedStart = startTime.toISOString().slice(0, 19);

          // Format end time
          const endTime = new Date(lecture.endTime._seconds * 1000);
          const formattedEnd = endTime.toISOString().slice(0, 19);

          return {
            id: lecture.id,
            title: lecture.course,
            start: formattedStart,
            end: formattedEnd,
            extendedProps: {
              type: lecture.executionType,
              groups: lecture.groups
                .map((id: string | number) => groupMap[id] || "Unknown Group")
                .join(", "),
              teacher: lecture.tutors
                .map((id: string | number) => tutorMap[id] || "Unknown Tutor")
                .join(", "),
              location: lecture.rooms
                .map((id: string | number) => roomMap[id] || "Unknown Room")
                .join(", "),
              editable: false,
            },
          };
        }
      );
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedFacultyId) {
      fetchAllGroups();
    }
    if (selectedFacultyId && selectedBranch) {
      fetchData();
    }
  }, [selectedBranch, selectedFacultyId]);

  // So that the additional filters are stackable
  useEffect(() => {
    let filtered = events;

    if (selectedGroupId) {
      filtered = filtered.filter((event) =>
        event.extendedProps.groups.includes(groupMap[selectedGroupId!])
      );
    }

    if (selectedTutorId) {
      filtered = filtered.filter((event) =>
        event.extendedProps.teacher.includes(tutorMap[selectedTutorId!])
      );
    }

    if (selectedRoomId) {
      filtered = filtered.filter((event) =>
        event.extendedProps.location.includes(roomMap[selectedRoomId!])
      );
    }

    if (selectedCourseName) {
      filtered = filtered.filter((event) =>
        event.title.includes(selectedCourseName)
      );
    }

    setFilteredEvents(filtered);
  }, [selectedGroupId, selectedTutorId, selectedRoomId, selectedCourseName, events]);

  useEffect(() => {
    setEvents([]); // ???
    setSelectedFacultyId("");
    setSelectedFacultyName(null);
    setProgramId(null);
    setSelectedProgramName(null);
    setProgramDuration(null);
    setSelectedYear(null);
    setSelectedYearName(null);
    setSelectedBranch(null);
    setSelectedBranchName(null);
    setSelectedCourseName(null);
    setSelectedGroupName(null);
    setSelectedRoomName(null);
    setSelectedTutorName(null);
    setSelectedGroupId(null); // Clear the selected group ID
    setSelectedTutorId(null); // Clear the selected tutor ID
    setSelectedRoomId(null); // Clear the selected room ID

    localStorage.removeItem("selectedFacultyId");
    localStorage.removeItem("selectedProgramId");
    localStorage.removeItem("selectedYearId");
    localStorage.removeItem("selectedBranchId");
    localStorage.removeItem("selectedGroupId"); // Remove selected group ID from local storage
    localStorage.removeItem("selectedTutorId"); // Remove selected tutor ID from local storage
    localStorage.removeItem("selectedRoomId"); // Remove selected room ID from local storage
  }, []);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event =
      events.find((event: Event) => event.id === clickInfo.event.id) ||
      customEvents.find(
        (event: CustomEvent) => event.id === clickInfo.event.id
      );
    if (event) {
      setSelectedEvent(event);
      setMode(event.extendedProps.editable ? "edit" : "view");
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

  const handleDateSelect = () => {
    if (isAuthenticated) {
      setMode("add");
      setOpen(true);
    }
  };

  // fetching custom events
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
          // Format start time
          const startTime = new Date(eventData.startTime._seconds * 1000);
          const formattedStart = startTime.toISOString().slice(0, 19);

          // Format end time
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

  // adding custom event
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
      console.error("Error fetching data:", error);
    }
  };

  // updating custom event
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
      console.error("Error fetching data:", error);
    }
  };

  // deleting custom event
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
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="w-full p-5">
      <h1 className="text-modra text-3xl font-bold mb-4">Timetable</h1>
      <div className="flex flex-col items-start mb-4 space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <DropdownMenuFaculties
          onSelectFaculty={(id) => {
            setSelectedFacultyId(id);
            const selectedFaculty = faculties.find(
              (faculty) => faculty.id === id
            );
            setSelectedFacultyName(
              selectedFaculty ? selectedFaculty.name : null
            );
            setSelectedProgramName(null);
            setSelectedYearName(null);
            setSelectedBranchName(null);
          }}
          selectedFacultyName={selectedFacultyName}
        />
        <DropdownMenuPrograms
          facultyId={selectedFacultyId}
          onSelectProgram={(id, duration) => {
            setProgramId(id);
            setProgramDuration(duration);
            const selectedProgram = programs.find(
              (program) => program.id === id
            );
            setSelectedProgramName(
              selectedProgram ? selectedProgram.name : null
            );
            setSelectedYearName(null);
            setSelectedBranchName(null);
          }}
          selectedProgramName={selectedProgramName}
        />
        <DropdownMenuYear
          programDuration={programDuration}
          onSelectYear={(year) => {
            setSelectedYear(year);
            setSelectedYearName(year ? year.toString() : null);
            setSelectedBranchName(null);
          }}
          selectedYear={selectedYearName}
        />
        <DropdownMenuBranches
          facultyId={selectedFacultyId}
          programId={programId || ""}
          selectedYear={selectedYear}
          onSelectBranch={(id) => {
            setSelectedBranch(id);
            const selectedBranch = branches.find((branch) => branch.id === id);
            setSelectedBranchName(selectedBranch ? selectedBranch.name : null);
          }}
          selectedBranchName={selectedBranchName}
        />
      </div>
      {selectedBranch && (
        <div className="flex flex-col items-start mb-4 space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <DropdownMenuCourses
            branchId={selectedBranch}
            programId={programId}
            onSelectCourse={(name) => {
              setSelectedCourseName(name);
              localStorage.setItem("selectedCourseName", name); // Save selected course name to local storage
            }}
            selectedCourseName={selectedCourseName}
          />
          <DropdownMenuGroups
            branchId={selectedBranch}
            programId={programId}
            onSelectGroup={(id, name) => {
              setSelectedGroupId(id);
              setSelectedGroupName(name);
              localStorage.setItem("selectedGroupId", id); // Save selected group ID to local storage
            }}
            selectedGroupName={selectedGroupName}
          />
          <DropdownMenuRooms
            facultyId={selectedFacultyId}
            onSelectRoom={(id, name) => {
              setSelectedRoomId(id);
              setSelectedRoomName(name);
              localStorage.setItem("selectedRoomId", id); // Save selected room ID to local storage
            }}
            selectedRoomName={selectedRoomName}
          />
          <DropdownMenuTutors
            facultyId={selectedFacultyId}
            onSelectTutor={(id, name) => {
              setSelectedTutorId(id);
              setSelectedTutorName(name);
              localStorage.setItem("selectedTutorId", id); // Save selected tutor ID to local storage
            }}
            selectedTutorName={selectedTutorName}
          />
        </div>
      )}
      <div className="mt-4 w-full bg-white rounded-lg p-4">
        <FullCalendar
          ref={calendarRef}
          height={"auto"}
          slotMinTime={"7:00"}
          slotMaxTime={"21:00"}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          weekends={false}
          events={filteredEvents}
          eventContent={renderEventContent}
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

      <CustomModal
        isOpen={open}
        toggle={handleCloseModal}
        mode={mode}
        onSave={handleAddEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
      />
    </div>
  );
};

export default Timetable;
