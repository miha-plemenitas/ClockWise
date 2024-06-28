import React, { useState } from "react";
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
import useGroups from "../../Components/Hooks/useGroups";

interface DropdownMenuGroupsProps {
  branchId: string | null;
  programId: string | null;
  onSelectGroups: (selectedGroups: string[]) => void;
  selectedGroupNames: string[];
}

const DropdownMenuGroups: React.FC<DropdownMenuGroupsProps> = ({
  branchId,
  programId,
  onSelectGroups,
  selectedGroupNames,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { groups, loading, error } = useGroups(branchId, programId);

  const handleSelect = (group: string) => {
    const updatedSelectedGroups = selectedGroupNames.includes(group)
      ? selectedGroupNames.filter((name) => name !== group)
      : [...selectedGroupNames, group];
    onSelectGroups(updatedSelectedGroups);
  };

  if (!branchId || !programId) {
    return <p>Select a branch and program to load groups.</p>;
  }

  if (loading) {
    return <p>Loading groups...</p>;
  }

  if (error) {
    return <p>Error loading groups: {error}</p>;
  }

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
          {groups.map((group) => (
            <DropdownMenuCheckboxItem
              key={group.id}
              checked={selectedGroupNames.includes(group.name)}
              onCheckedChange={() => handleSelect(group.name)}
            >
              {group.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedGroupNames.length > 0 && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedGroupNames.join(", ")}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuGroups;
