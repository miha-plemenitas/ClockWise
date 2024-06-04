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
import usePrograms from "../../Components/Hooks/usePrograms";

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
      localStorage.removeItem("selectedCourseId");
      localStorage.removeItem("selectedGroupId");
      localStorage.removeItem("selectedRoomId");
      localStorage.removeItem("selectedTutorId");
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

export default DropdownMenuPrograms;
