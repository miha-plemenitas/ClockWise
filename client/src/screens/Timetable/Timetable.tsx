import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import axios from "axios";
import SaveButton from "../../Components/SaveButton/SaveButton";
import { Switch } from "../../Components/ui/switch";
import AvaibleTimeSlotsModal from "../../Components/Modal/AvailableTimeSlotsModal";
import TimeSlots from "./TimeSlots";
import { Card } from "../../Components/ui/card";

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
  facultyId: string | null;
  name: string | null;
  isVerified: boolean | null;
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
  facultyId,
  name,
  isVerified
}) => {
  const navigate = useNavigate();
  const [isTutorMode, setIsTutorMode] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [openFind, setOpenFind] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "add">("add");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const [selectedTutors, setSelectedTutors] = useState<{ id: string; name: string }[]>([]);
  const [selectedRoomNames, setSelectedRoomNames] = useState<string[]>([]);
  const [selectedCourseNames, setSelectedCourseNames] = useState<string[]>([]);
  const [allCourseNames, setAllCourseNames] = useState<string[]>([]);

  const [availableSlots, setAvailableSlots] = useState<any>('');
  const [names, setNames] = useState<any>('');

  useEffect(() => {
    const storedMode = localStorage.getItem("isTutorMode");
    if (storedMode) {
      setIsTutorMode(storedMode === "true");
    }
  }, []);

  useEffect(() => {
    if (isTutorMode) {
      localStorage.setItem("isTutorMode", "true");
      navigate("/tutortimetable");
    } else {
      localStorage.setItem("isTutorMode", "false");
    }
  }, [isTutorMode, navigate]);

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

  const { branches } = useBranches(
    selectedFacultyId,
    programId || "",
    selectedYear
  );

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
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);

      // Log the fetched events
      console.log("Fetched lectures:", formattedEvents);

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
    if (selectedFacultyId && selectedBranch) {
      fetchData();
    }
  }, [selectedBranch, selectedFacultyId]);

  useEffect(() => {
    let filtered = events;

    if (selectedGroupNames.length > 0) {
      filtered = filtered.filter((event) =>
        selectedGroupNames.some((name) =>
          event.extendedProps.groups.some((group) => group.name === name)
        )
      );
    }

    if (selectedTutors.length > 0) {
      filtered = filtered.filter((event) =>
        selectedTutors.some((tutor) =>
          event.extendedProps.tutors.some(
            (eventTutor) => eventTutor.name === tutor.name
          )
        )
      );
    }

    if (selectedRoomNames.length > 0) {
      filtered = filtered.filter((event) =>
        selectedRoomNames.some((name) =>
          event.extendedProps.rooms.some((room) => room.name === name)
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
    setSelectedFacultyId("");
    setSelectedFacultyName(null);
    setProgramId(null);
    setSelectedProgramName(null);
    setProgramDuration(null);
    setSelectedYear(null);
    setSelectedYearName(null);
    setSelectedBranch(null);
    setSelectedBranchName(null);
    localStorage.removeItem("selectedFacultyId");
    localStorage.removeItem("selectedProgramId");
    localStorage.removeItem("selectedYearId");
    localStorage.removeItem("selectedBranchId");

    clearFilters();
    setAvailableSlots('');
  }, []);

  const isTutorInArray = (tutorName: any, tutorsArray: any): boolean => {
    return tutorsArray.some((tutor: { name: string }) =>
      tutor.name.toLowerCase().includes(tutorName.toLowerCase())
    );
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event =
      events.find((event: Event) => event.id === clickInfo.event.id) ||
      customEvents.find(
        (event: CustomEvent) => event.id === clickInfo.event.id
      );

    if (event && event.extendedProps.lecture) {
      if (role === "Student" || !role || (role === "Tutor" && !isTutorInArray(name, event.extendedProps.tutors)) || (role === "Referat" && facultyId !== selectedFacultyId)) {
        setSelectedEvent(event);
        setMode("view");
        setOpen(true);
      } else if ((role === "Referat" && facultyId === selectedFacultyId && isVerified) || (role === "Tutor" && isTutorInArray(name, event.extendedProps.tutors) && isVerified)) {
        setSelectedEvent(event);
        setMode("edit");
        setOpen(true);
      } else if (!isVerified && role !== 'Student') {
        setSelectedEvent(event);
        setMode("view");
        setOpen(true);
      }
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
    setOpen(false);
  };

  const handleDateSelect = () => {
    if (isAuthenticated && role !== "Referat") {
      setMode("add");
      setOpen(true);
    } else if (isAuthenticated && role === "Referat" && selectedBranch && selectedFacultyId && isVerified) {
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
              lecture: eventData.lecture,
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
    if (eventInfo.lecture && selectedFacultyId && selectedBranch) {
      eventInfo.branch_ids = [parseInt(selectedBranch, 10)];
      eventInfo.branches = [{ id: parseInt(selectedBranch, 10) }];

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
          "https://europe-west3-pameten-urnik.cloudfunctions.net/lecture-add",
          eventInfo,
          {
            params: {
              facultyId: selectedFacultyId,
            },
            headers: headers,
          }
        );
        if (response.status === 201) {
          setOpen(false);
          fetchData();
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
      }
    } else {
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
    }
  };

  const handleUpdateEvent = async (eventInfo: any) => {
    if (eventInfo.lecture && selectedFacultyId && selectedBranch) {
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
          "https://europe-west3-pameten-urnik.cloudfunctions.net/lecture-update",
          eventInfo,
          {
            params: {
              facultyId: selectedFacultyId,
            },
            headers: headers,
          }
        );
        if (response.status === 200) {
          setOpen(false);
          fetchData();
        }
      } catch (error: any) {
        console.error("Error updating event:", error.response || error.message);
      }
    } else {
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
        console.error("Error updating event:", error.response || error.message);
      }
    }
  };

  const handleDeleteEvent = async (eventId: any) => {
    if (events.find((event: Event) => event.id === eventId)) {
    } else {
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
    }
  };

  const handleOpenFindModal = () => {
    setOpenFind(true);
  }

  const handleCloseFindModal = () => {
    setOpenFind(false);
  };

  const handleFindAvailableTimeSlots = async (data: any) => {
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
        "https://europe-west3-pameten-urnik.cloudfunctions.net/lecture-findAvailableByIds",
        {
          params: {
            facultyId: data.facultyId,
            startTime: data.startTime,
            endTime: data.endTime,
            groupId: data.groupId,
            tutorId: data.tutorId,
            roomsId: data.roomId
          },
          headers: headers,
        }
      );

      setNames({
        faculty: data.faculty,
        group: data.group,
        room: data.room,
        tutor: data.tutor
      })

      setAvailableSlots(response.data.result);
      setOpenFind(false);
    } catch (error) {
      console.error("Error finding available time slots:", error);
    }
  }

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
            <label className="mr-2">Enable Tutor Timetable</label>
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
      <Card className="mt-4 w-full bg-white rounded-lg p-4 shadow">
        <FullCalendar
          ref={calendarRef}
          height={"auto"}
          slotMinTime={"07:00"}
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
      </Card>
      <div className="flex space-x-2 mt-4">
        <button
          onClick={clearFilters}
          className="bg-oranzna text-white hover:bg-oranzna-700 rounded-lg px-4 py-2 flex items-center justify-center"
        >
          Clear Filters
        </button>
        <button
          onClick={handleOpenFindModal}
          className="bg-modra text-white hover:bg-modra-700 rounded-lg px-4 py-2 flex items-center justify-center"
        >
          Find Available Time Slots
        </button>
        {(role === "Student" || role === "Tutor") && (
          <SaveButton
            isAuthenticated={isAuthenticated}
            uid={uid}
            events={filteredEvents}
          />
        )}
      </div>
      <div>
        {availableSlots && <TimeSlots data={availableSlots} names={names} />}
      </div>
      <AvaibleTimeSlotsModal
        isOpen={openFind}
        toggle={handleCloseFindModal}
        onFind={handleFindAvailableTimeSlots}
      />
      <CustomModal
        isOpen={open}
        toggle={handleCloseModal}
        mode={mode}
        onSave={handleAddEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        role={role}
        selectedFacultyId={selectedFacultyId}
      />
    </div>
  );
};

export default Timetable;
