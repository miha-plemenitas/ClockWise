import { useState, useEffect } from "react";
import { firestore } from "../../Config/firebase";

const useBranches = (
  facultyId: string,
  programId: string | number,
  selectedYear: number | null
) => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      if (facultyId && programId && selectedYear !== null) {
        //console.log(`Fetching branches for facultyId: ${facultyId}, programId: ${programId}, selectedYear: ${selectedYear}`);
        setLoading(true);
        setError(null);

        try {
          const branchesRef = firestore
            .collection("faculties")
            .doc(facultyId)
            .collection("branches")
            .where("programId", "==", Number(programId)) // Convert programId to number
            .where("year", "==", Number(selectedYear)); // Ensure year is a number

          const snapshot = await branchesRef.get();
          if (snapshot.empty) {
            console.warn("No matching branches found.");
          }

          const branchesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          //console.log("Fetched branches:", branchesList);
          setBranches(branchesList);
        } catch (err) {
          console.error("Error fetching branches:", err);
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      } else {
        setBranches([]);
        setLoading(false);
      }
    };

    fetchBranches();
  }, [facultyId, programId, selectedYear]);

  return { branches, loading, error };
};

export default useBranches;
