"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Assignment {
  id: string;
  performanceId: string;
  songId: string;
  instrument: string;
  memberId: string;
}

export function useAssignments(performanceId?: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no performanceId, fetch all assignments (useful for global view but can be heavy)
    // The user filters are performance-based, so this is appropriate.
    const q = performanceId
      ? query(collection(db, "assignments"), where("performanceId", "==", performanceId))
      : query(collection(db, "assignments"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Assignment[];
        setAssignments(docs);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("assignments listener failed:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [performanceId]);

  const assignMember = async (songId: string, instrument: string, memberId: string, targetPerfId?: string) => {
    const perfId = targetPerfId || performanceId;
    if (!perfId) return;
    
    // Support multiple players per instrument by adding memberId to the document ID
    const safeInstrument = instrument.replace(/\s+/g, '_');
    const id = `${perfId}_${songId}_${safeInstrument}_${memberId}`;
    
    await setDoc(doc(db, "assignments", id), {
      performanceId: perfId,
      songId,
      instrument,
      memberId,
      updatedAt: serverTimestamp(),
    });
  };

  const removeAssignment = async (songId: string, instrument: string, memberId: string, targetPerfId?: string) => {
    const perfId = targetPerfId || performanceId;
    if (!perfId) return;
    const safeInstrument = instrument.replace(/\s+/g, '_');
    const id = `${perfId}_${songId}_${safeInstrument}_${memberId}`;
    await deleteDoc(doc(db, "assignments", id));
  };

  return { assignments, loading, error, assignMember, removeAssignment };
}
