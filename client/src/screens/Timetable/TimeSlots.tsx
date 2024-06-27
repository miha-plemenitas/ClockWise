import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";

interface TimeSlotsProps {
    data: any;
    names: any
}

const TimeSlots = ({ data, names }: TimeSlotsProps) => {

    const columns: GridColDef[] = [
        { field: "date", headerName: "Date", width: 120 },
        { field: "startTime", headerName: "Start Time", width: 150 },
        { field: "endTime", headerName: "End Time", width: 150 },
        { field: "duration", headerName: "Duration", width: 100 }, // Added duration column
    ];

    const transformedData = Object.keys(data).flatMap(date =>
        data[date].map((slot: { start: any; end: any; duration: any; }, index: any) => ({
            id: `${date}-${slot.start}-${index}`,
            date,
            startTime: slot.start,
            endTime: slot.end,
            duration: slot.duration, // Include duration
        }))
    );

    return (
        <div className="flex flex-col h-full mt-6"> {/* Changed from flex-row to flex-col */}
            <div className="mb-2"> {/* Added a small margin for spacing */}
                <h2>Available Time Slots for:</h2>
                <p>
                    <strong>Group:</strong> {names.group}, {' '}
                    <strong>Tutor:</strong> {names.tutor}, {' '}
                    <strong>Room:</strong> {names.room}
                </p>
            </div>

            <div className="w-full md:w-1/3">
                <DataGrid
                    rows={transformedData}
                    columns={columns}
                />
            </div>
        </div>
    );
}

export default TimeSlots;