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
import useBranches from "../../Components/Hooks/useBranches";

interface DropdownMenuBranchesProps {
  facultyId: string;
  programId: string;
  selectedYear: number | null;
  onSelectBranch: (branchId: string | null) => void;
  selectedBranchName: string | null;
}

const DropdownMenuBranches: React.FC<DropdownMenuBranchesProps> = ({
  facultyId,
  programId,
  selectedYear,
  onSelectBranch,
  selectedBranchName,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { branches, loading, error } = useBranches(
    facultyId,
    programId,
    selectedYear
  );

  useEffect(() => {
    const storedBranchId = localStorage.getItem("selectedBranchId");
    if (storedBranchId) {
      setSelectedBranch(storedBranchId);
      onSelectBranch(storedBranchId);
    }
  }, [branches, onSelectBranch]);

  if (loading) {
    return <p>Loading branches...</p>;
  }

  if (error) {
    return <p>Error loading branches: {error}</p>;
  }

  const handleSelect = (value: string) => {
    setSelectedBranch(value);
    onSelectBranch(value);
    localStorage.setItem("selectedBranchId", value);
  };

  return (
    <div className="mb-4 w-48">
      <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-modra text-white hover:bg-modra-700 flex items-center space-x-2 w-full">
            <span>Branch</span>
            <FaChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-max max-w-sm">
          <DropdownMenuLabel className="text-modra">
            Select Branch
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedBranch || ""}
            onValueChange={handleSelect}
          >
            {branches.map((branch) => (
              <DropdownMenuRadioItem key={branch.id} value={branch.id}>
                {branch.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedBranchName && selectedBranch && (
        <div className="overflow-auto whitespace-nowrap mt-2 text-sm text-gray-700 font-medium border border-gray-300 p-2 rounded">
          {selectedBranchName}
        </div>
      )}
    </div>
  );
};

export default DropdownMenuBranches;
