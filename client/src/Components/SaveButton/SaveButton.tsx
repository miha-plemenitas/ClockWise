interface SaveButtonProps {
    isAuthenticated: boolean;
    onSave: (timetableData: any) => void;
  }

const SaveButton: React.FC<SaveButtonProps> = ({ isAuthenticated, onSave }) => {

    if(isAuthenticated) {
        return (
            <button className="bg-modra text-white hover:bg-modra-700 rounded-lg px-4 py-2 flex items-center justify-center" onClick={onSave}>
                Save to dashboard
            </button>
        );
    } else {
        return (
            <div>

            </div>
        );
    }
}

export default SaveButton;
