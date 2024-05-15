import React from "react";
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
  const [selectedOption, setSelectedOption] = React.useState(
    "ELEKTROTEHNIKA UN (BU10)"
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-modra text-white hover:bg-modra-700">
          Study Program
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
          <DropdownMenuRadioItem value="ELEKTROTEHNIKA  (BM10) - 2. stopnja">
            ELEKTROTEHNIKA (BM10) - 2. stopnja
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="INFORMATIKA IN PODATKOVNE TEHNOLOGIJE (BM80) - 2. stopnja">
            INFORMATIKA IN PODATKOVNE TEHNOLOGIJE (BM80) - 2. stopnja
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="MEDIJSKE KOMUNIKACIJE (BM50) - 2. stopnja">
            MEDIJSKE KOMUNIKACIJE (BM50) - 2. stopnja
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="RAČUNALNIŠTVO IN INFORMACIJSKE  TEHNOLOGIJE (BM20) - 2. stopnja">
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
  const [selectedYear, setSelectedYear] = React.useState("1");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-modra text-white hover:bg-modra-700">Year</Button>
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
  const [selectedField, setSelectedField] = React.useState("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-modra text-white hover:bg-modra-700">
          Field
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
          <DropdownMenuRadioItem value="">Option 1</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="">Option 2</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const Timetable: React.FC<TimetableProps> = ({ timetableData }) => {
  return (
    <div className="p-5">
      <div className="flex flex-col items-start mb-4">
        <div className="flex space-x-4">
          <DropdownMenuProgram />
          <DropdownMenuYear />
          <DropdownMenuField />
        </div>
        <div className="mt-4 w-full">
          <FullCalendar
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            weekends={false}
            events={events}
            eventContent={renderEventContent}
          />
        </div>
      </div>
    </div>
  );
};

export default Timetable;
