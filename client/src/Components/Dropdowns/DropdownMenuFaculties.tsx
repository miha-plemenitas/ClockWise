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
import useFaculties from "../../Components/Hooks/useFaculties";

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
      localStorage.removeItem("selectedCourseId");
      localStorage.removeItem("selectedGroupId");
      localStorage.removeItem("selectedRoomId");
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

export default DropdownMenuFaculties;
