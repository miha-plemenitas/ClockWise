import React, { useState, useEffect } from "react";
import { Button } from "../../Components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "../../Components/ui/dropdown-menu";
import { FaChevronDown } from "react-icons/fa";
import useTutors from "../../Components/Hooks/useTutors";

interface DropdownMenuTutorsProps {
  facultyId: string;
  onSelectTutors: (tutorNames: string[]) => void;
  selectedTutorNames: string[];
}

const DropdownMenuTutors: React.FC<DropdownMenuTutorsProps> = ({
  facultyId,
  onSelectTutors,
  selectedTutorNames,
}) => {
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { tutors, loading, error } = useTutors(facultyId);

  useEffect(() => {
    const storedTutorNames = JSON.parse(
      localStorage.getItem("selectedTutorNames") || "[]"
    );
    if (storedTutorNames) {
      setSelectedTutors(storedTutorNames);
      onSelectTutors(storedTutorNames);
    }
  }, [tutors, onSelectTutors]);

  if (loading) {
    return <p>Loading tutors...</p>;
  }

  if (error) {
    return <p>Error loading tutors: {error}</p>;
  }

  const handleSelect = (tutorName: string) => {
    let updatedSelectedTutors;
    if (selectedTutors.includes(tutorName)) {
      updatedSelectedTutors = selectedTutors.filter(
        (name) => name !== tutorName
      );
    } else {
      updatedSelectedTutors = [...selectedTutors, tutorName];
    }
    setSelectedTutors(updatedSelectedTutors);
    onSelectTutors(updatedSelectedTutors);
    localStorage.setItem(
      "selectedTutorNames",
      JSON.stringify(updatedSelectedTutors)
    );
  };

  return (
    <div className="mb-4 w-48">
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2 w-full">
            <span>Tutors</span>
            <FaChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-max max-w-sm">
          <DropdownMenuLabel className="text-modra">
            Select Tutors
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tutors.map((tutor) => (
            <DropdownMenuCheckboxItem
              key={tutor.tutorId}
              checked={selectedTutors.includes(
                `${tutor.firstName} ${tutor.lastName}`
              )}
              onCheckedChange={() =>
                handleSelect(`${tutor.firstName} ${tutor.lastName}`)
              }
            >
              {tutor.firstName} {tutor.lastName}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedTutorNames.length > 0 && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedTutorNames.join(", ")}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuTutors;
