import { useState, useEffect } from "react";
import { firestore } from "../../Config/firebase";

interface Room {
  id: string;
  roomName: string;
  name: string;
}

const useRooms = (facultyId: string | null) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        if (facultyId) {
          const snapshot = await firestore
            .collection("faculties")
            .doc(facultyId)
            .collection("rooms")
            .get();

          const allRooms = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Room[];


          const roomsWithName = allRooms.map(room => ({
            ...room,
            name: room.roomName
          }));

          roomsWithName.sort((a, b) => a.roomName.localeCompare(b.roomName));

          setRooms(allRooms);
        } else {
          setRooms([]);
        }
      } catch (error) {
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [facultyId]);

  return { rooms, loading, error };
};

export default useRooms;
