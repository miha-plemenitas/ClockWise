import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import CustomModal from "../../Components/Modal/CustomModal";
import { BASE_URL } from "../../api";
import { firestore } from "../../Config/firebase";
import dayjs, { Dayjs } from "dayjs";

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
import useGroups from "../../Components/Hooks/useGroups";
import axios from "axios";

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <>
      <b>{eventInfo.event.title}</b>
      <p>{eventInfo.event.extendedProps.prostor}</p>
    </>
  );
}

interface TimetableProps {
  isAuthenticated: boolean;
  uid: string | null;
  login: () => void;
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

interface Group {
  id: string;
  branchId: number;
  programId: number;
  name: string;
}

const Timetable: React.FC<TimetableProps> = ({ isAuthenticated, uid, login }) => {
  // events on timetable
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "add">("add");
  const calendarRef = useRef<FullCalendar>(null);

  // dropdowns
  const [selectedFacultyId, setSelectedFacultyId] = useState(() => localStorage.getItem("selectedFacultyId") || "");
  const [selectedFacultyName, setSelectedFacultyName] = useState<string | null>(null);
  const { faculties } = useFaculties();

  const [programId, setProgramId] = useState<string | null>(() => localStorage.getItem("selectedProgramId") || null);
  const [selectedProgramName, setSelectedProgramName] = useState<string | null>(null);
  const { programs } = usePrograms(selectedFacultyId);

  const [programDuration, setProgramDuration] = useState<number | null>(null);

  const [selectedYear, setSelectedYear] = useState<number | null>(() => Number(localStorage.getItem("selectedYearId")) || null);
  const [selectedYearName, setSelectedYearName] = useState<string | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<string | null>(() => localStorage.getItem("selectedBranchId") || null);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);

  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(null);

  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  const [selectedRoomName, setSelectedRoomName] = useState<string | null>(null);

  const [selectedTutorName, setSelectedTutorName] = useState<string | null>(null);

  const { branches } = useBranches(selectedFacultyId, programId || "", selectedYear);

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
      const response = await axios.get(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/lecture-getAllForBranch",
        {
          params: {
            facultyId: selectedFacultyId,
            branchId: selectedBranch,
            startTime: "2023-09-01T00:00:00Z"
          },
          withCredentials: true,
        }
      );

      const formattedEvents: Event[] = response.data.result.map((lecture: any) => {

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
            groups: lecture.groups.map((id: string | number) => groupMap[id] || "Unknown Group").join(", "),
            teacher: lecture.tutors.map((id: string | number) => tutorMap[id] || "Unknown Tutor").join(", "),
            location: lecture.rooms.map((id: string | number) => roomMap[id] || "Unknown Room").join(", "),
            editable: false,
          },
        };
      });
      setEvents(formattedEvents);

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          login();
          setTimeout(() => fetchData(), 500);
        } catch (loginError) {
          console.error("Error:", loginError);
        }
      } else {
        console.error("Error fetching data:", error);
      }
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

    localStorage.removeItem("selectedFacultyId");
    localStorage.removeItem("selectedProgramId");
    localStorage.removeItem("selectedYearId");
    localStorage.removeItem("selectedBranchId");

  }, []);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(
      (event: Event) => event.id === clickInfo.event.id
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

  // fetching custom events - POPRAVI!
  /*
  useEffect(() => {
    if (isAuthenticated && uid) {
      const unsubscribe = firestore
        .collection("users")
        .doc(uid)
        .collection("events")
        .onSnapshot((snapshot) => {
          const updatedEvents: Event[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title,
            start: doc.data().start,
            end: doc.data().end,
            extendedProps: {
              date: dayjs(doc.data().extendedProps.date),
              type: doc.data().extendedProps.type,
              groups: doc.data().extendedProps.groups,
              teacher: doc.data().extendedProps.teacher,
              location: doc.data().extendedProps.location,
              editable: doc.data().extendedProps.editable,
            },
          }));
          setEvents(updatedEvents);
        });

      return () => unsubscribe();
    
    }
  }, [uid]);
  */

  // adding custom event 
  const handleAddEvent = async (eventInfo: any) => {
    console.log(eventInfo);
    try {
      const response = await axios.post("https://europe-west3-pameten-urnik.cloudfunctions.net/event-add",
        { uid, ...eventInfo },
        { withCredentials: true }
      );
      if (response.status === 201) {
        setOpen(false);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          login();
          setTimeout(() => handleAddEvent, 500);
        } catch (loginError) {
          console.error("Error:", loginError);
        }
      } else {
        console.error("Error fetching data:", error);
      }
    }
  };

  // updating custom event - POPRAVI!
  const handleUpdateEvent = (eventInfo: any) => {
    fetch(`${BASE_URL}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...eventInfo,
        uid: uid,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update event");
        }
        return response.json();
      })
      .then((data) => {
        setOpen(false);
      })
      .catch((error) => {
        console.error("Error updating event:", error);
      });
  };

  // deleting custom event - DODAJ!
  // ...

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
            }}
            selectedCourseName={selectedCourseName}
          />
          <DropdownMenuGroups
            branchId={selectedBranch}
            programId={programId}
            onSelectGroup={(id, name) => {
              setSelectedGroupName(name);
            }}
            selectedGroupName={selectedGroupName}
          />
          <DropdownMenuRooms
            facultyId={selectedFacultyId}
            onSelectRoom={(id, name) => {
              setSelectedRoomName(name);
            }}
            selectedRoomName={selectedRoomName}
          />
          <DropdownMenuTutors
            facultyId={selectedFacultyId}
            onSelectTutor={(id, name) => {
              setSelectedTutorName(name);
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
          events={events}
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
        event={selectedEvent}
      />
    </div>
  );
};

export default Timetable;
