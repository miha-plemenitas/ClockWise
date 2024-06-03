import { useState, useEffect } from "react";
import { firestore } from "../../Config/firebase";

interface Course {
  id: string;
  course: string;
  branchId: number;
  programId: number;
}

const useCourses = (branchId: string | null, programId: string | null) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId || !programId) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const snapshot = await firestore.collectionGroup("courses").get();
        const allCourses: Course[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];

        const filteredCourses = allCourses.filter(
          (course) =>
            course.branchId === Number(branchId) &&
            course.programId === Number(programId)
        );

        setCourses(filteredCourses);
      } catch (err) {
        console.error("Error loading courses:", err);
        setError("Error loading courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [branchId, programId]);

  return { courses, loading, error };
};

export default useCourses;
