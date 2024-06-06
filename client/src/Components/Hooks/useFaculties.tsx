import { useState, useEffect } from "react";
import { firestore } from "../../Config/firebase";

interface Faculty {
  id: string;
  facultyId: number;
  name: string;
  numberOfPrograms: number;
  schoolCode: string;
}

const useFaculties = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const facultiesCollection = await firestore
          .collection("faculties")
          .get();
        const facultiesData = facultiesCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Faculty[];
        //console.log("Fetched faculties:", facultiesData);
        setFaculties(facultiesData);
      } catch (error) {
        console.error("Error fetching faculties:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  return { faculties, loading, error };
};

export default useFaculties;
