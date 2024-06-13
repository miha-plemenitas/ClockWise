import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import { Button } from "../../Components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import useCourses from "../../Components/Hooks/useCourses";

interface DropdownMenuCoursesProps {
  branchId: string | null;
  programId: string | null;
  onSelectCourses: (selectedCourses: string[]) => void;
  selectedCourseNames: string[];
  allCourseNames: string[];
}

const DropdownMenuCourses: React.FC<DropdownMenuCoursesProps> = ({
  branchId,
  programId,
  onSelectCourses,
  selectedCourseNames,
  allCourseNames,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { courses, loading, error } = useCourses(branchId, programId);

  const handleSelect = (course: string) => {
    const updatedSelectedCourses = selectedCourseNames.includes(course)
      ? selectedCourseNames.filter((name) => name !== course)
      : [...selectedCourseNames, course];
    onSelectCourses(updatedSelectedCourses);
  };

  if (!branchId || !programId) {
    return <p>Select a branch and program to load courses.</p>;
  }

  if (loading) {
    return <p>Loading courses...</p>;
  }

  if (error) {
    return <p>Error loading courses: {error}</p>;
  }

  return (
    <div className="mb-4 w-48">
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2 w-full">
            <span>Courses</span>
            <FaChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-max max-w-sm">
          <DropdownMenuLabel className="text-modra">
            Select Course
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allCourseNames.map((course, index) => (
            <DropdownMenuCheckboxItem
              key={index}
              checked={selectedCourseNames.includes(course)}
              onCheckedChange={() => handleSelect(course)}
            >
              {course}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedCourseNames.length > 0 && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedCourseNames.join(", ")}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuCourses;
