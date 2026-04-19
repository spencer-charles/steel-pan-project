"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  setDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AvailabilityStatus = "available" | "unavailable";

export interface Availability {
  id: string;
  memberId: string;
  performanceId: string;
  status: AvailabilityStatus;
}

export function useAvailability(performanceId?: string) {
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no performanceId is provided, we can optionally fetch all or none.
    // Given the dashboard needs it per-performance, we'll fetch for the provided ID.
    if (!performanceId) {
        setAvailability({});
        setLoading(false);
        return;
    }

    const q = query(
      collection(db, "availability"), 
      where("performanceId", "==", performanceId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Record<string, AvailabilityStatus> = {};
      snapshot.docs.forEach((doc) => {
        const avail = doc.data() as Availability;
        data[avail.memberId] = avail.status;
      });
      setAvailability(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [performanceId]);

  const updateAvailability = async (memberId: string, status: AvailabilityStatus, targetPerfId?: string) => {
    const perfId = targetPerfId || performanceId;
    if (!perfId) return;
    const id = `${perfId}_${memberId}`;
    await setDoc(doc(db, "availability", id), {
      performanceId: perfId,
      memberId,
      status,
      updatedAt: serverTimestamp(),
    });
  };

  return { availability, loading, updateAvailability };
}
