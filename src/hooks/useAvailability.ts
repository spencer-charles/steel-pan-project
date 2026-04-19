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

export type AvailabilityStatus = "available" | "unavailable" | "pending";

export interface Availability {
  id: string;
  memberId: string;
  performanceId: string;
  status: AvailabilityStatus;
}

export function useAvailability(performanceId?: string) {
  const [allAvailability, setAllAvailability] = useState<Record<string, Record<string, AvailabilityStatus>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "availability"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Record<string, Record<string, AvailabilityStatus>> = {};
      snapshot.docs.forEach((doc) => {
        const avail = doc.data() as Availability;
        if (!data[avail.performanceId]) {
          data[avail.performanceId] = {};
        }
        data[avail.performanceId][avail.memberId] = avail.status;
      });
      setAllAvailability(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Derived filtered availability for compatibility
  const availability = performanceId ? (allAvailability[performanceId] || {}) : {};

  const updateAvailability = async (memberId: string, status: AvailabilityStatus, targetPerfId: string) => {
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

  return { availability, allAvailability, loading, updateAvailability };
}
