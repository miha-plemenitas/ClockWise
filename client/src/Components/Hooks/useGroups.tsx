import { useState, useEffect } from "react";
import { firestore } from "../../Config/firebase";

interface Group {
  id: string;
  branchId: number;
  programId: number;
  name: string;
}

const useGroups = (branchId: string | null, programId: string | null) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId || !programId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const fetchGroups = async () => {
      setLoading(true);
      try {
        const snapshot = await firestore.collectionGroup("groups").get();
        const allGroups: Group[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Group[];

        const filteredGroups = allGroups.filter(
          (group) =>
            group.branchId === Number(branchId) &&
            group.programId === Number(programId)
        );

        setGroups(filteredGroups);
      } catch (err) {
        console.error("Error loading groups:", err);
        setError("Error loading groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [branchId, programId]);

  return { groups, loading, error };
};

export default useGroups;
