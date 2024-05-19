import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
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

const events = [
  {
    id: "1",
    title: "Praktikum",
    start: "2024-05-17T10:00:00",
    end: "2024-05-17T13:00:00",
    extendedProps: {
      tip: "Predavanja",
      skupina: "RV1",
      izvajalec: "Janez Novak",
      prostor: "Alfa",
    },
  },
  {
    id: "2",
    title: "Statistika",
    start: "2024-05-15T07:00:00",
    end: "2024-05-15T10:00:00",
    extendedProps: {
      tip: "Vaje",
      skupina: "RV1",
      izvajalec: "Jana Novak",
      prostor: "Gama",
    },
  },
];

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
}

const DropdownMenuFaculties: React.FC<DropdownMenuFacultiesProps> = ({
  onSelectFaculty,
}) => {
  const [selectedFaculties, setSelectedFaculties] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { faculties, loading, error } = useFaculties();

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
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2">
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
  );
};

interface DropdownMenuProgramsProps {
  facultyId: string;
  onSelectProgram: (programId: string, programDuration: number | null) => void;
}

const DropdownMenuPrograms: React.FC<DropdownMenuProgramsProps> = ({
  facultyId,
  onSelectProgram,
}) => {
  const [selectedPrograms, setSelectedPrograms] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { programs, loading, error } = usePrograms(facultyId);

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
    } else {
      onSelectProgram("", null);
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2">
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
  );
};

interface DropdownMenuYearProps {
  programDuration: number | null;
  onSelectYear: (year: number | null) => void;
}

const DropdownMenuYear: React.FC<DropdownMenuYearProps> = ({
  programDuration,
  onSelectYear,
}) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
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
      setSelectedYear(null);
    }
  }, [programDuration]);

  const handleSelect = (value: string) => {
    setSelectedYear(value);
    onSelectYear(Number(value));
  };

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2">
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
          value={selectedYear || ""}
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
  );
};

interface DropdownMenuBranchesProps {
  facultyId: string;
  programId: string;
  selectedYear: number | null;
}

const DropdownMenuBranches: React.FC<DropdownMenuBranchesProps> = ({
  facultyId,
  programId,
  selectedYear,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { branches, loading, error } = useBranches(
    facultyId,
    programId,
    selectedYear
  );

  if (loading) {
    return <p>Loading branches...</p>;
  }

  if (error) {
    return <p>Error loading branches: {error}</p>;
  }

  const handleSelect = (value: string) => {
    setSelectedBranch(value);
  };

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2">
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
            <DropdownMenuRadioItem key={branch.id} value={branch.name}>
              {branch.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Timetable = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [open, setOpen] = React.useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [programId, setProgramId] = useState<string | null>(null);
  const [programDuration, setProgramDuration] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find((event) => event.id === clickInfo.event.id);
    setSelectedEvent(event);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setOpen(false);
  };

  return (
    <div className="w-full p-5">
      <h1 className="text-modra text-3xl font-bold mb-4">Timetable</h1>
      <div className="flex flex-col items-start mb-4">
        <div className="flex space-x-4">
          <DropdownMenuFaculties onSelectFaculty={setSelectedFacultyId} />
          <DropdownMenuPrograms
            facultyId={selectedFacultyId}
            onSelectProgram={(id, duration) => {
              setProgramId(id);
              setProgramDuration(duration);
            }}
          />
          <DropdownMenuYear
            programDuration={programDuration}
            onSelectYear={setSelectedYear}
          />
          <DropdownMenuBranches
            facultyId={selectedFacultyId}
            programId={programId || ""}
            selectedYear={selectedYear}
          />
        </div>
        <div className="mt-4 w-full bg-white rounded-lg p-4">
          <FullCalendar
            height={"auto"}
            slotMinTime={"7:00"}
            slotMaxTime={"21:00"}
            plugins={[timeGridPlugin]}
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
            eventClick={handleEventClick}
          />
        </div>
      </div>

      <CustomModal
        isOpen={open}
        toggle={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
};

export default Timetable;
