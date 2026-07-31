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

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  instruments: string[];
  photoURL?: string;
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "members"), orderBy("name"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Member[];
        setMembers(docs);
        setError(null);
        setLoading(false);
      },
      // Without this the listener fails silently and the UI shows an empty
      // roster forever.
      (err) => {
        console.error("members listener failed:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addMember = async (member: Omit<Member, "id">) => {
    const docRef = await addDoc(collection(db, "members"), {
      ...member,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    const memberRef = doc(db, "members", id);
    await updateDoc(memberRef, updates);
  };

  const deleteMember = async (id: string) => {
    const memberRef = doc(db, "members", id);
    await deleteDoc(memberRef);
  };

  return { members, loading, error, addMember, updateMember, deleteMember };
}
