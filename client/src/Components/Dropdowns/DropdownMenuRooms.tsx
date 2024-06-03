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
import useRooms from "../../Components/Hooks/useRooms";

interface DropdownMenuRoomsProps {
  facultyId: string | null;
  onSelectRoom: (id: string, name: string) => void;
  selectedRoomName: string | null;
}

const DropdownMenuRooms: React.FC<DropdownMenuRoomsProps> = ({
  facultyId,
  onSelectRoom,
  selectedRoomName,
}) => {
  const [selectedRooms, setSelectedRooms] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { rooms, loading, error } = useRooms(facultyId);

  useEffect(() => {
    const storedRoomId = localStorage.getItem("selectedRoomId");
    if (storedRoomId) {
      const selectedRoom = rooms.find((room) => room.id === storedRoomId);
      if (selectedRoom) {
        setSelectedRooms(selectedRoom.roomName);
        onSelectRoom(storedRoomId, selectedRoom.roomName);
      }
    }
  }, [rooms, onSelectRoom]);

  if (loading) {
    return <p>Loading rooms...</p>;
  }

  if (error) {
    return <p>Error loading rooms: {error}</p>;
  }

  const handleSelect = (value: string) => {
    setSelectedRooms(value);
    const selectedRoom = rooms.find((room) => room.roomName === value);
    if (selectedRoom) {
      onSelectRoom(selectedRoom.id, selectedRoom.roomName);
      localStorage.setItem("selectedRoomId", selectedRoom.id);
    }
  };

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
          <DropdownMenuRadioGroup
            value={selectedRooms}
            onValueChange={handleSelect}
          >
            {rooms.map((room) => (
              <DropdownMenuRadioItem key={room.id} value={room.roomName}>
                {room.roomName}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedRoomName && selectedRooms && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedRoomName}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuRooms;
