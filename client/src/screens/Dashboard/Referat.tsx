import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar, GridColDef } from "@mui/x-data-grid";
import { Button } from "../../Components/ui/button";
import axios from "axios";
import { Buffer } from "buffer";
import useFaculties from "../../Components/Hooks/useFaculties";
import { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import HeatmapModal from "../../Components/Modal/HeatmapModal";
import Plot from "react-plotly.js";
import CircularProgress from "@mui/material/CircularProgress";
import { Card } from "../../Components/ui/card";

interface DayOff {
  id?: string;
  startDate: Dayjs;
  endDate?: Dayjs | null;
  facultyId?: string | null;
}

interface ReferatProps {
  facultyId: string | null;
  isVerified: boolean | null;
}

const Referat: React.FC<ReferatProps> = ({ facultyId, isVerified }) => {
  const { faculties } = useFaculties();
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [selectedFacultyName, setSelectedFacultyName] = useState<string>("");

  const [heatmapModalOpen, setHeatmapModalOpen] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [heatmapType, setHeatmapType] = useState<string>("");
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);

  useEffect(() => {
    fetchDays();
  }, []);

  const columnsDaysOff: GridColDef[] = [
    { field: "startDate", headerName: "Start date", width: 250 },
    { field: "endDate", headerName: "End date", width: 250 },
    {
      field: "akcija",
      headerName: "",
      width: 100,
      renderCell: (params) => (
        <Button className="bg-oranzna text-white hover:bg-oranzna-700" onClick={() => handleRemoveDayOff(params.row.id)}>
          Remove
        </Button>
      ),
    },
  ];

  const handleAddDayOff = async () => {
    try {
      if (startDate) {
        const novProstiDan: DayOff = {
          startDate: startDate,
          facultyId: facultyId,
        };

        if (endDate && endDate.isAfter(startDate)) {
          novProstiDan.endDate = endDate;
        } else {
          novProstiDan.endDate = null;
        }

        const username = process.env.REACT_APP_USERNAME;
        const password = process.env.REACT_APP_PASSWORD;

        const bufferedCredentials = Buffer.from(`${username}:${password}`);
        const credentials = bufferedCredentials.toString("base64");
        const headers = {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        };

        await axios.post(
          "https://europe-west3-pameten-urnik.cloudfunctions.net/admin-addDay",
          novProstiDan,
          { headers: headers }
        );

        setStartDate(null);
        setEndDate(null);
        setSelectedFacultyId(null);
        fetchDays();
      }
    } catch (error) {
      console.error("Error adding day off:", error);
    }
  };

  const handleRemoveDayOff = async (dayId: string) => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      await axios.delete(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/admin-deleteDay",
        {
          data: { facultyId, dayId },
          headers: headers,
        }
      );
      fetchDays();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDays = async () => {
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/admin-getAll",
        {
          params: { facultyId },
          headers: headers,
        }
      );
      setDaysOff(
        response.data.result.map((dayOff: { startDate: any; endDate: any }) => {
          const formatDate = (dateString: string | number | Date) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}. ${month}. ${year}`;
          };
      
          return {
            ...dayOff,
            startDate: formatDate(dayOff.startDate),
            endDate: dayOff.endDate ? formatDate(dayOff.endDate) : null, // <-- Conditional formatting
          };
        })
      );
    } catch (error) {
      console.error("Error fetching days:", error);
    }
  };

  const handleOpenHeatmapModal = () => {
    setHeatmapModalOpen(true);
  };

  const handleCloseHeatmapModal = () => {
    setHeatmapModalOpen(false);
  };

  const handleGenerateHeatmap = async (generateData: any) => {
    setLoadingHeatmap(true);
    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const bufferedCredentials = Buffer.from(`${username}:${password}`);
      const credentials = bufferedCredentials.toString("base64");
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };
      const { selectedFaculty, selectedCollection, selectedType } =
        generateData;
      const response = await axios.get(
        "https://europe-west3-pameten-urnik.cloudfunctions.net/schedule-heatMap",
        {
          params: {
            facultyId: selectedFaculty,
            collection: selectedCollection,
            type: selectedType,
          },
          headers,
        }
      );

      setHeatmapData(response.data.result);
      setHeatmapType(selectedType);
      const selectedFacultyObj = faculties.find(
        (faculty) => faculty.facultyId === selectedFaculty
      );
      setSelectedFacultyName(selectedFacultyObj?.name || "");
      setHeatmapModalOpen(false);
      console.log("Heatmap data:", response.data.result);
    } catch (error) {
      console.error("Error generating heatmap:", error);
    } finally {
      setLoadingHeatmap(false);
    }
  };

  const prepareHeatmapData = (heatmapData: any) => {
    const { x, y, z } = heatmapData;
    return { x, y, z };
  };

  return (
    <div>
      {isVerified && (
        <div className="flex flex-col 2xl:flex-row gap-4">
          <div className="2xl:w-1/2">
            <div className="bg-modra text-white py-2 px-4 rounded mb-4 text-center text-lg font-semibold">
              Determining non-working days
            </div>
            <Card className="p-4">
              <div className="flex flex-col gap-4">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className="flex gap-2 items-center">
                    <DatePicker
                      label="Start date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                    />
                    <DatePicker
                      label="End date (optional)"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                    />
                    <Button
                      className="bg-modra text-white hover:bg-modra-700"
                      onClick={handleAddDayOff}
                    >
                      Add
                    </Button>
                  </div>
                </LocalizationProvider>
              </div>
              <div style={{ height: 400, width: "100%" }} className="mt-4">
                <DataGrid
                  rows={daysOff}
                  columns={columnsDaysOff}
                  slots={{ toolbar: GridToolbar }}
                />
              </div>
            </Card>
          </div>
          <div className="2xl:w-1/2 flex flex-col justify-center items-center">
            <HeatmapModal
              isOpen={heatmapModalOpen}
              toggle={handleCloseHeatmapModal}
              onGenerate={handleGenerateHeatmap}
            />
            <Button
              onClick={handleOpenHeatmapModal}
              className="bg-oranzna text-white hover:bg-oranzna-700 items-center space-x-2"
            >
              <span>Generate heatmap</span>
            </Button>
            {loadingHeatmap ? (
              <div className="flex justify-center items-center mt-4">
                <CircularProgress sx={{ color: "grey.500" }} />
              </div>
            ) : (
              heatmapData && (
                <Card className="mt-4 w-full bg-white rounded-lg p-4">
                  <Plot
                    data={[
                      {
                        z: prepareHeatmapData(heatmapData).z,
                        x: prepareHeatmapData(heatmapData).x,
                        y: prepareHeatmapData(heatmapData).y,
                        type: "heatmap",
                        colorscale: [
                          [0, "rgb(0, 0, 139)"],
                          [1, "rgb(255, 140, 0)"],
                        ],
                        colorbar: {
                          title: heatmapType === "count" ? "Count" : "Frequency",
                          titleside: "right",
                        },
                      },
                    ]}
                    layout={{
                      title: `Lecture Heatmap for: ${selectedFacultyName}`,
                      xaxis: {
                        title: "Hour",
                        tickmode: "linear",
                        dtick: 1,
                        tick0: 7,
                        showgrid: true,
                        zeroline: false,
                        range: [7, 21],
                      },
                      yaxis: {
                        title: "Day",
                        tickvals: [
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                        ],
                        ticktext: [
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                        ],
                        showgrid: true,
                        zeroline: false,
                        tickmode: "array",
                      },
                      margin: { t: 40, b: 40, l: 100, r: 60 },
                    }}
                    config={{ responsive: true }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Card>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Referat;
