import axios from "axios";
import { Buffer } from "buffer";

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

const SaveButton: React.FC<SaveButtonProps> = ({ isAuthenticated, uid, events }) => {

    const handleSaveTimetable = async () => {
        // eslint-disable-next-line no-restricted-globals
        const confirmOverwrite = confirm("Are you sure you want to save this timetable? If you already have a saved timetable, it will be overwritten.");

        if (confirmOverwrite) {
            try {
                const username = process.env.REACT_APP_USERNAME;
                const password = process.env.REACT_APP_PASSWORD;

                const bufferedCredentials = Buffer.from(`${username}:${password}`);
                const credentials = bufferedCredentials.toString("base64");
                const headers = {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/json",
                };
                const response = await axios.post(
                    "https://europe-west3-pameten-urnik.cloudfunctions.net/timetable-add",
                    { uid: uid, events: events },
                    { headers: headers }
                );

                if (response.status === 201) {
                    alert('Timetable saved successfully!');
                }
                console.log(response);

            } catch (error: any) {
                console.error("Error fetching data:", error);
            }
        }
    }

    if (isAuthenticated) {
        return (
            <button className="bg-modra text-white hover:bg-modra-700 rounded-lg px-4 py-2 flex items-center justify-center" onClick={handleSaveTimetable}>
                Save timetable
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
