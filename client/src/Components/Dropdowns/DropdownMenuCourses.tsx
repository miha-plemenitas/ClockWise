import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import { Button } from "../../Components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import useCourses from "../../Components/Hooks/useCourses";

interface DropdownMenuCoursesProps {
  branchId: string | null;
  programId: string | null;
  onSelectCourse: (courseName: string) => void;
  selectedCourseName: string | null;
}

const DropdownMenuCourses: React.FC<DropdownMenuCoursesProps> = ({
  branchId,
  programId,
  onSelectCourse,
  selectedCourseName,
}) => {
  const [selectedCourses, setSelectedCourses] = useState(
    selectedCourseName || ""
  );
  const [isOpen, setIsOpen] = useState(false);
  const { courses, loading, error } = useCourses(branchId, programId);

  useEffect(() => {
    if (selectedCourseName) {
      setSelectedCourses(selectedCourseName);
    }
  }, [selectedCourseName]);

  if (!branchId || !programId) {
    return <p>Select a branch and program to load courses.</p>;
  }

  if (loading) {
    return <p>Loading courses...</p>;
  }

  if (error) {
    return <p>Error loading courses: {error}</p>;
  }

  const handleSelect = (value: string) => {
    setSelectedCourses(value);
    const selectedCourse = courses.find((course) => course.course === value);
    if (selectedCourse) {
      onSelectCourse(selectedCourse.course);
      localStorage.setItem("selectedCourseId", selectedCourse.id);
    }
  };

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
          <DropdownMenuRadioGroup
            value={selectedCourses}
            onValueChange={handleSelect}
          >
            {courses.map((course) => (
              <DropdownMenuRadioItem key={course.id} value={course.course}>
                {course.course}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedCourses && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedCourses}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuCourses;
