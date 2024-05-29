import React, { useState, useEffect } from "react";
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

import useFaculties from "../../Components/Hooks/useFaculties";
import usePrograms from "../../Components/Hooks/usePrograms";
import useBranches from "../../Components/Hooks/useBranches";

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

const Timetable: React.FC<TimetableProps> = ({ isAuthenticated, uid }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "add">("add");
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    () => localStorage.getItem("selectedFacultyId") || ""
  );
  const [selectedFacultyName, setSelectedFacultyName] = useState<string | null>(
    null
  );
  const { faculties } = useFaculties(); // Make sure this is defined to use faculties
  const [programId, setProgramId] = useState<string | null>(
    () => localStorage.getItem("selectedProgramId") || null
  );
  const [selectedProgramName, setSelectedProgramName] = useState<string | null>(
    null
  );
  const { programs } = usePrograms(selectedFacultyId); // Make sure this is defined to use programs
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
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(
    null
  );
  const { branches } = useBranches(
    selectedFacultyId,
    programId || "",
    selectedYear
  ); // Make sure this is defined to use branches

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

  const handleAddEvent = (eventInfo: any) => {
    fetch(`${BASE_URL}/add`, {
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
          throw new Error("Failed to add event");
        }
        return response.json();
      })
      .then((data) => {
        setOpen(false);
      })
      .catch((error) => {
        console.error("Error saving event:", error);
      });
  };

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

  return (
    <div className="w-full p-5">
      <h1 className="text-modra text-3xl font-bold mb-4">Timetable</h1>
      <div className="flex flex-col items-start mb-4">
        <div className="flex space-x-4">
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
              setSelectedCourseName(null);
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
              setSelectedYearName(null); // Clear subsequent selections
              setSelectedBranchName(null);
              setSelectedCourseName(null);
            }}
            selectedProgramName={selectedProgramName}
          />
          <DropdownMenuYear
            programDuration={programDuration}
            onSelectYear={(year) => {
              setSelectedYear(year);
              setSelectedYearName(year ? year.toString() : null);
              setSelectedBranchName(null); // Clear subsequent selections
              setSelectedCourseName(null);
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
              setSelectedCourseName(null); // Clear subsequent selections
            }}
            selectedBranchName={selectedBranchName}
          />
          <DropdownMenuCourses
            branchId={selectedBranch}
            programId={programId}
            onSelectCourse={(name) => {
              setSelectedCourseName(name);
            }}
            selectedCourseName={selectedCourseName}
          />
        </div>
        <div className="mt-4 w-full bg-white rounded-lg p-4">
          <FullCalendar
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
