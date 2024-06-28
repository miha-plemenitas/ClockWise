import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface TimeSlotsProps {
  data: any;
  names: any;
}

const TimeSlots = ({ data, names }: TimeSlotsProps) => {
  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 120 },
    { field: "startTime", headerName: "Start Time", width: 150 },
    { field: "endTime", headerName: "End Time", width: 150 },
    { field: "duration", headerName: "Duration", width: 100 },
  ];

  const transformedData = Object.keys(data).flatMap((date) => {
    const formattedDate = date.split("-").reverse().join(". ");

    return data[date].map(
      (slot: { start: any; end: any; duration: any }, index: any) => ({
        id: `${formattedDate}-${slot.start}-${index}`,
        date: formattedDate,
        startTime: slot.start,
        endTime: slot.end,
        duration: slot.duration,
      })
    );
  });

  return (
    <div className="flex flex-col h-full mt-6 bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h2 className="text-modra text-2xl font-bold mb-2">
          Available Time Slots for:
        </h2>
        <p className="text-gray-700">
          <span className="font-bold bg-gray-100 px-2 py-1 rounded">
            Group:
          </span>{" "}
          {names.group},{" "}
          <span className="font-bold bg-gray-100 px-2 py-1 rounded">
            Tutor:
          </span>{" "}
          {names.tutor},{" "}
          <span className="font-bold bg-gray-100 px-2 py-1 rounded">Room:</span>{" "}
          {names.room}
        </p>
      </div>
      <div className="w-full">
        <DataGrid
          rows={transformedData}
          columns={columns}
          autoHeight
          className="rounded-lg border border-gray-200"
          checkboxSelection={false}
        />
      </div>
    </div>
  );
};

export default TimeSlots;
