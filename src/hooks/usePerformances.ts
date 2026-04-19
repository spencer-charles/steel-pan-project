"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Performance {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  description?: string;
  status: "pending" | "confirmed" | "cancelled" | "past";
  setlist: string[]; // Array of song IDs
  isArchived?: boolean;
}

export function usePerformances() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "performances"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Performance[];
      setPerformances(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPerformance = async (performance: Omit<Performance, "id">) => {
    const docRef = await addDoc(collection(db, "performances"), {
      ...performance,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updatePerformance = async (id: string, updates: Partial<Performance>) => {
    const perfRef = doc(db, "performances", id);
    await updateDoc(perfRef, updates);
  };

  const deletePerformance = async (id: string) => {
    const perfRef = doc(db, "performances", id);
    await deleteDoc(perfRef);
  };

  return { performances, loading, addPerformance, updatePerformance, deletePerformance };
}
