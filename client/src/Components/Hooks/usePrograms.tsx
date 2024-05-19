import { useState, useEffect } from "react";
import { firestore } from "../../Config/firebase";

interface Program {
  id: string;
  name: string;
  programDuration: string;
  programId: number;
}

const usePrograms = (facultyId: string) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facultyId) {
      setPrograms([]);
      setLoading(false);
      return;
    }

    const fetchPrograms = async () => {
      try {
        const programsCollection = await firestore
          .collection("faculties")
          .doc(facultyId)
          .collection("programs")
          .get();
        const programsData = programsCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Program[];
        setPrograms(programsData);
      } catch (error) {
        console.error("Error fetching programs:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [facultyId]);

  return { programs, loading, error };
};

export default usePrograms;
