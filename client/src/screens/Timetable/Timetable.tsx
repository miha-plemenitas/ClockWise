import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "../../Components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import { FaChevronDown } from "react-icons/fa";
import CustomModal from "../../Components/Modal/CustomModal";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import useFaculties from "../../Components/Hooks/useFaculties";
import usePrograms from "../../Components/Hooks/usePrograms";
import useBranches from "../../Components/Hooks/useBranches";
import { BASE_URL } from "../../api";
import { firestore } from "../../Config/firebase";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import { Buffer } from "buffer";

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <>
      <b>{eventInfo.event.title}</b>
      <p>{eventInfo.event.extendedProps.prostor}</p>
    </>
  );
}

interface DropdownMenuFacultiesProps {
  onSelectFaculty: (facultyId: string) => void;
  selectedFacultyName: string | null;
}

const DropdownMenuFaculties: React.FC<DropdownMenuFacultiesProps> = ({
  onSelectFaculty,
  selectedFacultyName,
}) => {
  const [selectedFaculties, setSelectedFaculties] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { faculties, loading, error } = useFaculties();

  useEffect(() => {
    const storedFacultyId = localStorage.getItem("selectedFacultyId");
    if (storedFacultyId) {
      const selectedFaculty = faculties.find(
        (faculty) => faculty.id === storedFacultyId
      );
      if (selectedFaculty) {
        setSelectedFaculties(selectedFaculty.name);
        onSelectFaculty(selectedFaculty.id);
      }
    }
  }, [faculties, onSelectFaculty]);

  if (loading) {
    return <p>Loading faculties...</p>;
  }

  if (error) {
    return <p>Error loading faculties: {error}</p>;
  }

  const handleSelect = (value: string) => {
    setSelectedFaculties(value);
    const selectedFaculty = faculties.find((faculty) => faculty.name === value);
    if (selectedFaculty) {
      onSelectFaculty(selectedFaculty.id);
      localStorage.setItem("selectedFacultyId", selectedFaculty.id);
      // Clear subsequent selections
      localStorage.removeItem("selectedProgramId");
      localStorage.removeItem("selectedYearId");
      localStorage.removeItem("selectedBranchId");
    }
  };

  return (
    <div className="mb-4 w-48">
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2 w-full">
            <span>Faculties</span>
            <FaChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-max max-w-sm">
          <DropdownMenuLabel className="text-modra">
            Select Faculty
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedFaculties}
            onValueChange={handleSelect}
          >
            {faculties.map((faculty) => (
              <DropdownMenuRadioItem key={faculty.id} value={faculty.name}>
                {faculty.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedFacultyName && selectedFaculties && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedFacultyName}
        </div>
      )}
    </div>
  );
};

interface DropdownMenuProgramsProps {
  facultyId: string;
  onSelectProgram: (programId: string, programDuration: number | null) => void;
  selectedProgramName: string | null;
}

const DropdownMenuPrograms: React.FC<DropdownMenuProgramsProps> = ({
  facultyId,
  onSelectProgram,
  selectedProgramName,
}) => {
  const [selectedPrograms, setSelectedPrograms] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { programs, loading, error } = usePrograms(facultyId);

  useEffect(() => {
    const storedProgramId = localStorage.getItem("selectedProgramId");
    if (storedProgramId) {
      const selectedProgram = programs.find(
        (program) => program.id === storedProgramId
      );
      if (selectedProgram) {
        setSelectedPrograms(selectedProgram.name);
        onSelectProgram(
          selectedProgram.id,
          Number(selectedProgram.programDuration)
        );
      }
    }
  }, [programs, onSelectProgram]);

  if (loading) {
    return <p>Loading programs...</p>;
  }

  if (error) {
    return <p>Error loading programs: {error}</p>;
  }

  const handleSelect = (value: string) => {
    setSelectedPrograms(value);
    const selectedProgram = programs.find((program) => program.name === value);
    if (selectedProgram) {
      onSelectProgram(
        selectedProgram.id,
        Number(selectedProgram.programDuration)
      );
      localStorage.setItem("selectedProgramId", selectedProgram.id);
      // Clear subsequent selections
      localStorage.removeItem("selectedYearId");
      localStorage.removeItem("selectedBranchId");
    }
  };

  return (
    <div className="mb-4 w-48">
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2 w-full">
            <span>Study Program</span>
            <FaChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-max max-w-sm">
          <DropdownMenuLabel className="text-modra">
            Select Study Program
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedPrograms}
            onValueChange={handleSelect}
          >
            {programs.map((program) => (
              <DropdownMenuRadioItem key={program.id} value={program.name}>
                {program.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedProgramName && selectedPrograms && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedProgramName}
        </div>
      )}
    </div>
  );
};

interface DropdownMenuYearProps {
  programDuration: number | null;
  onSelectYear: (year: number | null) => void;
  selectedYear: string | null;
}

const DropdownMenuYear: React.FC<DropdownMenuYearProps> = ({
  programDuration,
  onSelectYear,
  selectedYear,
}) => {
  const [selectedYearState, setSelectedYearState] = useState<string | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    if (programDuration) {
      const generateYears = () => {
        const yearOptions = [];
        for (let i = 1; i <= programDuration; i++) {
          yearOptions.push(i);
        }
        setYears(yearOptions);
      };
      generateYears();
    } else {
      setYears([]);
      setSelectedYearState(null);
    }
  }, [programDuration]);

  useEffect(() => {
    const storedYearId = localStorage.getItem("selectedYearId");
    if (storedYearId) {
      setSelectedYearState(storedYearId);
      onSelectYear(Number(storedYearId));
    }
  }, [onSelectYear]);

  const handleSelect = (value: string) => {
    setSelectedYearState(value);
    onSelectYear(Number(value));
    localStorage.setItem("selectedYearId", value);
    // Clear subsequent selections
    localStorage.removeItem("selectedBranchId");
  };

  return (
    <div className="mb-4 w-48">
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2 w-full">
            <span>Year</span>
            <FaChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-max max-w-sm">
          <DropdownMenuLabel className="text-modra">
            Select Year
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedYearState || ""}
            onValueChange={handleSelect}
          >
            {years.map((year) => (
              <DropdownMenuRadioItem key={year} value={year.toString()}>
                {year}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedYear && selectedYearState && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedYear}
        </div>
      )}
    </div>
  );
};

interface DropdownMenuBranchesProps {
  facultyId: string;
  programId: string;
  selectedYear: number | null;
  onSelectBranch: (branchId: string | null) => void;
  selectedBranchName: string | null;
}

const DropdownMenuBranches: React.FC<DropdownMenuBranchesProps> = ({
  facultyId,
  programId,
  selectedYear,
  onSelectBranch,
  selectedBranchName,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { branches, loading, error } = useBranches(
    facultyId,
    programId,
    selectedYear
  );

  useEffect(() => {
    const storedBranchId = localStorage.getItem("selectedBranchId");
    if (storedBranchId) {
      setSelectedBranch(storedBranchId);
      onSelectBranch(storedBranchId);
    }
  }, [branches, onSelectBranch]);

  if (loading) {
    return <p>Loading branches...</p>;
  }

  if (error) {
    return <p>Error loading branches: {error}</p>;
  }

  const handleSelect = (value: string) => {
    setSelectedBranch(value);
    onSelectBranch(value);
    localStorage.setItem("selectedBranchId", value);
  };

  return (
    <div className="mb-4 w-48">
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2 w-full">
            <span>Branch</span>
            <FaChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-max max-w-sm">
          <DropdownMenuLabel className="text-modra">
            Select Branch
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedBranch || ""}
            onValueChange={handleSelect}
          >
            {branches.map((branch) => (
              <DropdownMenuRadioItem key={branch.id} value={branch.id}>
                {branch.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedBranchName && selectedBranch && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedBranchName}
        </div>
      )}
    </div>
  );
};

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
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "add">("add");

  const [selectedFacultyId, setSelectedFacultyId] = useState(() => localStorage.getItem("selectedFacultyId") || "");
  const [selectedFacultyName, setSelectedFacultyName] = useState<string | null>(null);
  const { faculties } = useFaculties(); // Make sure this is defined to use faculties
  const [programId, setProgramId] = useState<string | null>(() => localStorage.getItem("selectedProgramId") || null);
  const [selectedProgramName, setSelectedProgramName] = useState<string | null>(null);
  const { programs } = usePrograms(selectedFacultyId); // Make sure this is defined to use programs
  const [programDuration, setProgramDuration] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(() => Number(localStorage.getItem("selectedYearId")) || null);
  const [selectedYearName, setSelectedYearName] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(() => localStorage.getItem("selectedBranchId") || null);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  const { branches } = useBranches(selectedFacultyId, programId || "", selectedYear); // Make sure this is defined to use branches

  async function login() {

    const username = process.env.REACT_APP_USERNAME;
    const password = process.env.REACT_APP_PASSWORD;

    const bufferedCredentials = Buffer.from(`${username}:${password}`);
    const credentials = bufferedCredentials.toString("base64");
    const headers = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await axios.post("https://europe-west3-pameten-urnik.cloudfunctions.net/auth-login",
        { uid: username },
        { headers: headers, withCredentials: true }
      );

      console.log("Login successful", response);

    } catch (error) {
      console.error("Login failed", error);
    }

  }

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


  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.get("https://europe-west3-pameten-urnik.cloudfunctions.net/course-getAllForBranch", {
          params: {
            facultyId: selectedFacultyId,
            branchId: selectedBranch
          },
          withCredentials: true
        });
        console.log('Response:', response.data);
        /*
                const formattedEvents: EventInput[] = response.data.result.map((course) => {
                  return {
                    id: course.id,
                    title: course.course,
                    start: 
                    end: 
                    extendedProps: {
                      // ... 
                    },
                  };
                });
                setEvents(formattedEvents);
                */

      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          try {
            await login();
          } catch (loginError) {
            console.error('Napaka pri prijavi:', loginError);
          }
        } else {
          console.error('Error fetching data:', error);
        }
      }
    };

    if (selectedFacultyId && selectedBranch) {
      fetchData();
    }

    console.log(selectedBranch);
  }, [selectedBranch]);




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
              setSelectedProgramName(null); // Clear subsequent selections
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
              setSelectedYearName(null); // Clear subsequent selections
              setSelectedBranchName(null);
            }}
            selectedProgramName={selectedProgramName}
          />
          <DropdownMenuYear
            programDuration={programDuration}
            onSelectYear={(year) => {
              setSelectedYear(year);
              setSelectedYearName(year ? year.toString() : null);
              setSelectedBranchName(null); // Clear subsequent selections
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
