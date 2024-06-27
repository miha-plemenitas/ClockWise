import { useState, useEffect } from "react";
import { firestore } from "../../Config/firebase";

interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  tutorId: string;
  name: string;
}

const useTutors = (facultyId: string) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facultyId) return;

    const fetchTutors = async () => {
      try {
        const snapshot = await firestore
          .collection("faculties")
          .doc(facultyId)
          .collection("tutors")
          .get();

        const tutorsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tutor[];

        const tutorsWithName = tutorsData.map(tutor => ({
          ...tutor,
          name: `${tutor.firstName} ${tutor.lastName}`.toUpperCase()
        }));

        tutorsWithName.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toUpperCase();
          const nameB = `${b.firstName} ${b.lastName}`.toUpperCase();
          return nameA.localeCompare(nameB);
        });

        setTutors(tutorsWithName);
      } catch (error) {
        setError("Failed to load tutors");
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [facultyId]);

  return { tutors, loading, error };
};

export default useTutors;
