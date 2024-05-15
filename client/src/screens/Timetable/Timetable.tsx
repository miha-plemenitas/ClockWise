import React, { useState } from "react";
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

interface TimetableProps {
  timetableData: string[][];
}

const events = [{ title: "Meeting", start: new Date() }];

function renderEventContent(eventInfo: { timeText: any; event: any }) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );
}

export function DropdownMenuProgram() {
  const [selectedOption, setSelectedOption] = useState(
    "ELEKTROTEHNIKA UN (BU10)"
  );
  const [isOpen, setIsOpen] = useState(false);

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
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel className="text-modra">
          Select Study Program
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedOption}
          onValueChange={setSelectedOption}
        >
          <DropdownMenuRadioItem value="ELEKTROTEHNIKA UN (BU10)">
            ELEKTROTEHNIKA UN (BU10)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ELEKTROTEHNIKA VS (BV10)">
            ELEKTROTEHNIKA VS (BV10)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="INFORMATIKA IN TEHNOLOGIJE KOMUNICIRANJA UN (BU30)">
            INFORMATIKA IN TEHNOLOGIJE KOMUNICIRANJA UN (BU30)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="INFORMATIKA IN PODATKOVNE TEHNOLOGIJE (BU80)">
            INFORMATIKA IN PODATKOVNE TEHNOLOGIJE (BU80)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="INFORMATIKA IN TEHNOLOGIJE KOMUNICIRANJA VS (BV30)">
            INFORMATIKA IN TEHNOLOGIJE KOMUNICIRANJA VS (BV30)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="MEDIJSKE KOMUNIKACIJE (BU50)">
            MEDIJSKE KOMUNIKACIJE (BU50)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="RAČUNALNIŠTVO IN INFORMACIJSKE TEHNOLOGIJE UN (BU20)">
            RAČUNALNIŠTVO IN INFORMACIJSKE TEHNOLOGIJE UN (BU20)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="RAČUNALNIŠTVO IN INFORMACIJSKE TEHNOLOGIJE VS (BV20)">
            RAČUNALNIŠTVO IN INFORMACIJSKE TEHNOLOGIJE VS (BV20)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="TELEKOMUNIKACIJE (BU40)">
            TELEKOMUNIKACIJE (BU40)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="MEHATRONIKA (BU70)">
            MEHATRONIKA (BU70)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="MEHATRONIKA (BV70)">
            MEHATRONIKA (BV70)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ELEKTROTEHNIKA (BM10) - 2. stopnja">
            ELEKTROTEHNIKA (BM10) - 2. stopnja
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="INFORMATIKA IN PODATKOVNE TEHNOLOGIJE (BM80) - 2. stopnja">
            INFORMATIKA IN PODATKOVNE TEHNOLOGIJE (BM80) - 2. stopnja
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="MEDIJSKE KOMUNIKACIJE (BM50) - 2. stopnja">
            MEDIJSKE KOMUNIKACIJE (BM50) - 2. stopnja
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="RAČUNALNIŠTVO IN INFORMACIJSKE TEHNOLOGIJE (BM20) - 2. stopnja">
            RAČUNALNIŠTVO IN INFORMACIJSKE TEHNOLOGIJE (BM20) - 2. stopnja
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="TELEKOMUNIKACIJE (BM40) - 2. stopnja">
            TELEKOMUNIKACIJE (BM40) - 2. stopnja
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="MEHATRONIKA (BMM7) - 2. stopnja">
            MEHATRONIKA (BMM7) - 2. stopnja
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ERASMUS">ERASMUS</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ATHENA">ATHENA</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="KOOD">KOOD</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DropdownMenuYear() {
  const [selectedYear, setSelectedYear] = useState("1");
  const [isOpen, setIsOpen] = useState(false);

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
      <DropdownMenuContent className="w-32">
        <DropdownMenuLabel className="text-modra">
          Select Year
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedYear}
          onValueChange={setSelectedYear}
        >
          <DropdownMenuRadioItem value="1">1</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="2">2</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="3">3</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DropdownMenuField() {
  const [selectedField, setSelectedField] = useState("Option 1");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2">
          <span>Field</span>
          <FaChevronDown
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuLabel className="text-modra">
          Select Field
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedField}
          onValueChange={setSelectedField}
        >
          <DropdownMenuRadioItem value="Option 1">
            Option 1
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Option 2">
            Option 2
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DropdownMenuUniversity() {
  const [selectedUniversity, setSelectedUniversity] = useState(
    "Ekonomsko-poslovna fakulteta"
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2">
          <span>University</span>
          <FaChevronDown
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel className="text-modra">
          Select University
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedUniversity}
          onValueChange={setSelectedUniversity}
        >
          <DropdownMenuRadioItem value="Ekonomsko-poslovna fakulteta">
            Ekonomsko-poslovna fakulteta
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za elektrotehniko, računalništvo in informatiko">
            Fakulteta za elektrotehniko, računalništvo in informatiko
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za energetiko">
            Fakulteta za energetiko
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za gradbeništvo, prometno inženirstvo in arhitekturo">
            Fakulteta za gradbeništvo, prometno inženirstvo in arhitekturo
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za kemijo in kemijsko tehnologijo">
            Fakulteta za kemijo in kemijsko tehnologijo
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za kmetijstvo in biosistemske vede">
            Fakulteta za kmetijstvo in biosistemske vede
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za logistiko">
            Fakulteta za logistiko
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za naravoslovje in matematiko">
            Fakulteta za naravoslovje in matematiko
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za organizacijske vede">
            Fakulteta za organizacijske vede
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za strojništvo">
            Fakulteta za strojništvo
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za turizem">
            Fakulteta za turizem
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za varnostne vede">
            Fakulteta za varnostne vede
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Fakulteta za zdravstvene vede">
            Fakulteta za zdravstvene vede
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Filozofska fakulteta">
            Filozofska fakulteta
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Medicinska fakulteta">
            Medicinska fakulteta
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Pedagoška fakulteta">
            Pedagoška fakulteta
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Pravna fakulteta">
            Pravna fakulteta
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const Timetable: React.FC<TimetableProps> = ({ timetableData }) => {
  return (
    <div className="container mx-auto p-5">
      <h1 className="text-modra text-3xl font-bold mb-4">Timetable</h1>
      <div className="flex flex-col items-start mb-4">
        <div className="flex space-x-4">
          <DropdownMenuUniversity />
          <DropdownMenuProgram />
          <DropdownMenuYear />
          <DropdownMenuField />
        </div>
        <div className="mt-4 w-full bg-white rounded-lg p-4">
          <FullCalendar
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
            dayHeaderFormat={{ weekday: "short" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timetable;
