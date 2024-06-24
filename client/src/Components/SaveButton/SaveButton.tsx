import axios from "axios";
import { Buffer } from "buffer";
import { toast } from "src/Components/ui/use-toast";
import { ToastClose } from "src/Components/ui/toast";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    type: string;
    groups: string;
    teacher: string;
    location: string;
    editable: boolean;
  };
}

interface SaveButtonProps {
  isAuthenticated: boolean;
  uid: string | null;
  events: Event[];
}

const SaveButton: React.FC<SaveButtonProps> = ({
  isAuthenticated,
  uid,
  events,
}) => {
  const handleSaveTimetable = async () => {
    const confirmToast = toast({
      title: "Confirmation",
      description:
        "Are you sure you want to save this timetable? If you already have a saved timetable, it will be overwritten.",
      action: (
        <button
          className="inline-flex h-8 items-center justify-center rounded-md border border-white bg-white px-3 text-sm font-medium text-modra transition-colors hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
          onClick={async () => {
            try {
              // Format events
              const formattedEvents = events.map((event) => ({
                id: event.id,
                start: event.start,
                end: event.end,
                title: event.title,
                extendedProps: {
                  editable: event.extendedProps.editable,
                  groups: event.extendedProps.groups,
                  location: event.extendedProps.location,
                  teacher: event.extendedProps.teacher,
                  type: event.extendedProps.type,
                },
              }));

              const username = process.env.REACT_APP_USERNAME;
              const password = process.env.REACT_APP_PASSWORD;

              const bufferedCredentials = Buffer.from(
                `${username}:${password}`
              );
              const credentials = bufferedCredentials.toString("base64");
              const headers = {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
              };
              const response = await axios.post(
                "https://europe-west3-pameten-urnik.cloudfunctions.net/timetable-add",
                { uid: uid, events: formattedEvents },
                { headers: headers }
              );

              if (response.status === 201) {
                toast({
                  title: "Success",
                  description: "Timetable saved successfully!",
                  className: "bg-modra text-white",
                  action: <ToastClose className="text-white" />, // Ensure the close button is white
                });
              }
              console.log(response);
              confirmToast.dismiss();
            } catch (error: any) {
              toast({
                title: "Error",
                description: "There was a problem saving the timetable.",
                className: "bg-modra-700 text-white",
                action: <ToastClose className="text-white" />, // Ensure the close button is white
              });
              console.error("Error fetching data:", error);
              confirmToast.dismiss();
            }
          }}
        >
          Save
        </button>
      ),
      className: "bg-modra text-white",
    });
  };

  if (isAuthenticated) {
    return (
      <button
        className="bg-modra text-white hover:bg-modra-700 rounded-lg px-4 py-2 flex items-center justify-center"
        onClick={handleSaveTimetable}
      >
        Save timetable
      </button>
    );
  } else {
    return <div></div>;
  }
};

export default SaveButton;
