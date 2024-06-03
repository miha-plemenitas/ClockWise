import React, { useState, useEffect } from "react";
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
    localStorage.removeItem("selectedCourseId");
    localStorage.removeItem("selectedGroupId");
    localStorage.removeItem("selectedRoomId");
    localStorage.removeItem("selectedTutorId");
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

export default DropdownMenuYear;
