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
import useGroups from "../../Components/Hooks/useGroups";

interface DropdownMenuGroupsProps {
  branchId: string | null;
  programId: string | null;
  onSelectGroup: (groupId: string, groupName: string) => void;
  selectedGroupName: string | null;
}

const DropdownMenuGroups: React.FC<DropdownMenuGroupsProps> = ({
  branchId,
  programId,
  onSelectGroup,
  selectedGroupName,
}) => {
  const [selectedGroups, setSelectedGroups] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { groups, loading, error } = useGroups(branchId, programId);

  useEffect(() => {
    const storedGroupId = localStorage.getItem("selectedGroupId");
    if (storedGroupId) {
      const selectedGroup = groups.find((group) => group.id === storedGroupId);
      if (selectedGroup) {
        setSelectedGroups(selectedGroup.name);
        onSelectGroup(selectedGroup.id, selectedGroup.name);
      }
    }
  }, [groups, onSelectGroup]);

  if (loading) {
    return <p>Loading groups...</p>;
  }

  if (error) {
    return <p>Error loading groups: {error}</p>;
  }

  const handleSelect = (value: string) => {
    setSelectedGroups(value);
    const selectedGroup = groups.find((group) => group.name === value);
    if (selectedGroup) {
      onSelectGroup(selectedGroup.id, selectedGroup.name);
      localStorage.setItem("selectedGroupId", selectedGroup.id);
    }
  };

  return (
    <div className="mb-4 w-48">
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2 w-full">
            <span>Groups</span>
            <FaChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-max max-w-sm">
          <DropdownMenuLabel className="text-modra">
            Select Group
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedGroups}
            onValueChange={handleSelect}
          >
            {groups.map((group) => (
              <DropdownMenuRadioItem key={group.id} value={group.name}>
                {group.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedGroupName && selectedGroups && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedGroupName}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuGroups;
