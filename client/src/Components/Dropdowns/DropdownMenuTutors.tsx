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
  onSelectTutors: (tutors: { id: string; name: string }[]) => void;
  selectedTutorNames: string[];
}

const DropdownMenuTutors: React.FC<DropdownMenuTutorsProps> = ({
  facultyId,
  onSelectTutors,
  selectedTutorNames,
}) => {
  const [selectedTutors, setSelectedTutors] = useState<
    { id: string; name: string }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const { tutors, loading, error } = useTutors(facultyId);

  useEffect(() => {
    const storedTutors = JSON.parse(
      localStorage.getItem("selectedTutors") || "[]"
    );
    if (storedTutors.length > 0) {
      setSelectedTutors(storedTutors);
      onSelectTutors(storedTutors);
    }
  }, [tutors, onSelectTutors]);

  if (loading) {
    return <p>Loading tutors...</p>;
  }

  if (error) {
    return <p>Error loading tutors: {error}</p>;
  }

  const handleSelect = (tutor: { id: string; name: string }) => {
    let updatedSelectedTutors;
    if (selectedTutors.find((selectedTutor) => selectedTutor.id === tutor.id)) {
      updatedSelectedTutors = selectedTutors.filter(
        (selectedTutor) => selectedTutor.id !== tutor.id
      );
    } else {
      updatedSelectedTutors = [...selectedTutors, tutor];
    }
    setSelectedTutors(updatedSelectedTutors);
    onSelectTutors(updatedSelectedTutors);
    localStorage.setItem(
      "selectedTutors",
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
              checked={selectedTutors.some(
                (selectedTutor) => selectedTutor.id === tutor.tutorId
              )}
              onCheckedChange={() =>
                handleSelect({
                  id: tutor.tutorId,
                  name: `${tutor.firstName} ${tutor.lastName}`,
                })
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
