import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import CustomModal from "../../Components/Modal/CustomModal";
import { firestore } from "../../Config/firebase";
import { Dayjs } from "dayjs";
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
import SaveButton from "../../Components/SaveButton/SaveButton";
import { Switch } from "../../Components/ui/switch"; // Import Switch component

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
  role: string;
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

const Timetable: React.FC<TimetableProps> = ({
  isAuthenticated,
  uid,
  role,
}) => {
  const navigate = useNavigate(); // Use useNavigate for navigation
  const [isTutorMode, setIsTutorMode] = useState(false); // State to track switch

  // events on timetable
  const [events, setEvents] = useState<Event[]>([]);
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "add">("add");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const [selectedTutors, setSelectedTutors] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedRoomNames, setSelectedRoomNames] = useState<string[]>([]);
  const [selectedCourseNames, setSelectedCourseNames] = useState<string[]>([]);
  const [allCourseNames, setAllCourseNames] = useState<string[]>([]);
  const calendarRef = useRef<FullCalendar>(null);

  // Handle redirect when switch is toggled
  useEffect(() => {
    if (isTutorMode) {
      navigate("/tutortimetable");
    }
  }, [isTutorMode, navigate]);

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

  const [allGroups, setAllGroups] = useState<Group[]>([]);

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
            startTime: "2023-10-01T00:00:00Z",
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
              groups: lecture.group_ids
                .map((id: string | number) => groupMap[id] || "Unknown Group")
                .join(", "),
              teacher: lecture.tutor_ids
                .map((id: string | number) => tutorMap[id] || "Unknown Tutor")
                .join(", "),
              location: lecture.room_ids
                .map((id: string | number) => roomMap[id] || "Unknown Room")
                .join(", "),
              editable: false,
            },
          };
        }
      );
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);

      // Collect unique course names from lectures
      const uniqueCourses: string[] = Array.from(
        new Set(response.data.result.map((lecture: any) => lecture.course))
      );
      setAllCourseNames(uniqueCourses);
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

    if (selectedGroupNames.length > 0) {
      filtered = filtered.filter((event) =>
        selectedGroupNames.some((name) =>
          event.extendedProps.groups.includes(name)
        )
      );
    }

    if (selectedTutors.length > 0) {
      filtered = filtered.filter((event) =>
        selectedTutors.some((tutor) =>
          event.extendedProps.teacher.includes(tutor.name)
        )
      );
    }

    if (selectedRoomNames.length > 0) {
      filtered = filtered.filter((event) =>
        selectedRoomNames.some((name) =>
          event.extendedProps.location.includes(name)
        )
      );
    }

    if (selectedCourseNames.length > 0) {
      filtered = filtered.filter((event) =>
        selectedCourseNames.some((name) => event.title.includes(name))
      );
    }

    setFilteredEvents(filtered);
  }, [
    selectedGroupNames,
    selectedTutors,
    selectedRoomNames,
    selectedCourseNames,
    events,
  ]);

  const clearFilters = () => {
    setSelectedGroupNames([]);
    setSelectedTutors([]);
    setSelectedRoomNames([]);
    setSelectedCourseNames([]);
    setFilteredEvents(events);

    localStorage.removeItem("selectedGroupNames");
    localStorage.removeItem("selectedTutors");
    localStorage.removeItem("selectedRoomNames");
    localStorage.removeItem("selectedCourseNames");
  };

  useEffect(() => {
    setFilteredEvents([]);
    setSelectedFacultyId("");
    setSelectedFacultyName(null);
    setProgramId(null);
    setSelectedProgramName(null);
    setProgramDuration(null);
    setSelectedYear(null);
    setSelectedYearName(null);
    setSelectedBranch(null);
    setSelectedBranchName(null);
    setSelectedCourseNames([]);
    setSelectedGroupNames([]);
    setSelectedRoomNames([]);
    setSelectedTutors([]);

    localStorage.removeItem("selectedFacultyId");
    localStorage.removeItem("selectedProgramId");
    localStorage.removeItem("selectedYearId");
    localStorage.removeItem("selectedBranchId");
    localStorage.removeItem("selectedCourseNames");
    localStorage.removeItem("selectedGroupNames");
    localStorage.removeItem("selectedRoomNames");
    localStorage.removeItem("selectedTutors");
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
      console.error("Error updating event:", error);
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
      console.error("Error deleting event:", error);
    }
  };

  // saving timetable to dashboard
  const handleSaveTimetable = () => {};

  return (
    <div className="w-full p-5">
      <h1 className="text-modra text-3xl font-bold mb-4">Timetable</h1>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex flex-col items-start space-y-4 md:flex-row md:space-y-0 md:space-x-4">
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
              const selectedBranch = branches.find(
                (branch) => branch.id === id
              );
              setSelectedBranchName(
                selectedBranch ? selectedBranch.name : null
              );
            }}
            selectedBranchName={selectedBranchName}
          />
        </div>
        {role === "Tutor" && (
          <div className="flex items-center">
            <label className="mr-2">Switch 1</label>
            <Switch checked={isTutorMode} onCheckedChange={setIsTutorMode} />
          </div>
        )}
      </div>
      {selectedBranch && (
        <div className="flex flex-col items-start mb-4 space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <DropdownMenuCourses
            branchId={selectedBranch}
            programId={programId}
            onSelectCourses={(names) => {
              setSelectedCourseNames(names);
              localStorage.setItem(
                "selectedCourseNames",
                JSON.stringify(names)
              );
            }}
            selectedCourseNames={selectedCourseNames}
            allCourseNames={allCourseNames}
          />
          <DropdownMenuGroups
            branchId={selectedBranch}
            programId={programId}
            onSelectGroups={(names) => {
              setSelectedGroupNames(names);
              localStorage.setItem("selectedGroupNames", JSON.stringify(names));
            }}
            selectedGroupNames={selectedGroupNames}
          />
          <DropdownMenuRooms
            facultyId={selectedFacultyId}
            onSelectRooms={(names) => {
              setSelectedRoomNames(names);
              localStorage.setItem("selectedRoomNames", JSON.stringify(names));
            }}
            selectedRoomNames={selectedRoomNames}
          />
          <DropdownMenuTutors
            facultyId={selectedFacultyId}
            onSelectTutors={(tutors) => {
              setSelectedTutors(tutors);
              localStorage.setItem("selectedTutors", JSON.stringify(tutors));
            }}
            selectedTutorNames={selectedTutors.map((t) => t.name)}
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
          eventContent={renderEventContent}
          events={[
            ...filteredEvents.map((event) => ({ ...event, color: "#4890CB" })),
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
        <button
          onClick={clearFilters}
          className="bg-oranzna text-white hover:bg-oranzna-700 rounded-lg px-4 py-2 flex items-center justify-center"
        >
          Clear Filters
        </button>
        <SaveButton
          isAuthenticated={isAuthenticated}
          uid={uid}
          events={filteredEvents}
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
