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
import useTutors from "../../Components/Hooks/useTutors";

interface DropdownMenuTutorsProps {
  facultyId: string;
  onSelectTutor: (tutorId: string, tutorName: string) => void;
  selectedTutorName: string | null;
}

const DropdownMenuTutors: React.FC<DropdownMenuTutorsProps> = ({
  facultyId,
  onSelectTutor,
  selectedTutorName,
}) => {
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { tutors, loading, error } = useTutors(facultyId);

  useEffect(() => {
    const storedTutorId = localStorage.getItem("selectedTutorId");
    if (storedTutorId) {
      const selectedTutor = tutors.find(
        (tutor) => tutor.tutorId === storedTutorId
      );
      if (selectedTutor) {
        setSelectedTutor(selectedTutor.tutorId);
        onSelectTutor(
          selectedTutor.tutorId,
          `${selectedTutor.firstName} ${selectedTutor.lastName}`
        );
      }
    }
  }, [tutors, onSelectTutor]);

  if (loading) {
    return <p>Loading tutors...</p>;
  }

  if (error) {
    return <p>Error loading tutors: {error}</p>;
  }

  const handleSelect = (value: string) => {
    const selectedTutor = tutors.find((tutor) => tutor.tutorId === value);
    if (selectedTutor) {
      setSelectedTutor(selectedTutor.tutorId);
      onSelectTutor(
        selectedTutor.tutorId,
        `${selectedTutor.firstName} ${selectedTutor.lastName}`
      );
      localStorage.setItem("selectedTutorId", selectedTutor.tutorId);
    }
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
            Select Tutor
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedTutor || ""}
            onValueChange={handleSelect}
          >
            {tutors.map((tutor) => (
              <DropdownMenuRadioItem key={tutor.tutorId} value={tutor.tutorId}>
                {tutor.firstName} {tutor.lastName}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedTutorName && selectedTutor && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedTutorName}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuTutors;
