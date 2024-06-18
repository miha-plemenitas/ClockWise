import React from "react";

interface TutorTimetableProps {
  isAuthenticated: boolean;
  uid: string | null;
  role: string;
}

const TutorTimetable: React.FC<TutorTimetableProps> = ({
  isAuthenticated,
  uid,
  role,
}) => {
  return (
    <div className="w-full p-5">
      <h1 className="text-modra text-3xl font-bold mb-4">Tutor Timetable</h1>
      {/* Add the content for TutorTimetable here */}
    </div>
  );
};

export default TutorTimetable;
