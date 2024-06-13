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
import useRooms from "../../Components/Hooks/useRooms";

interface DropdownMenuRoomsProps {
  facultyId: string | null;
  onSelectRooms: (selectedRooms: string[]) => void;
  selectedRoomNames: string[];
}

const DropdownMenuRooms: React.FC<DropdownMenuRoomsProps> = ({
  facultyId,
  onSelectRooms,
  selectedRoomNames,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { rooms, loading, error } = useRooms(facultyId);

  const handleSelect = (room: string) => {
    const updatedSelectedRooms = selectedRoomNames.includes(room)
      ? selectedRoomNames.filter((name) => name !== room)
      : [...selectedRoomNames, room];
    onSelectRooms(updatedSelectedRooms);
  };

  if (loading) {
    return <p>Loading rooms...</p>;
  }

  if (error) {
    return <p>Error loading rooms: {error}</p>;
  }

  return (
    <div className="mb-4 w-48">
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2 w-full">
            <span>Rooms</span>
            <FaChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-max max-w-sm">
          <DropdownMenuLabel className="text-modra">
            Select Room
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {rooms.map((room) => (
            <DropdownMenuCheckboxItem
              key={room.id}
              checked={selectedRoomNames.includes(room.roomName)}
              onCheckedChange={() => handleSelect(room.roomName)}
            >
              {room.roomName}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedRoomNames.length > 0 && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedRoomNames.join(", ")}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuRooms;
