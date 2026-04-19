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

export interface Song {
  id: string;
  title: string;
  parts: string[];
  tags: string[];
}

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "songs"), orderBy("title"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Song[];
      setSongs(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addSong = async (song: Omit<Song, "id">) => {
    await addDoc(collection(db, "songs"), {
      ...song,
      createdAt: serverTimestamp(),
    });
  };

  const updateSong = async (id: string, updates: Partial<Song>) => {
    const songRef = doc(db, "songs", id);
    await updateDoc(songRef, updates);
  };

  const deleteSong = async (id: string) => {
    const songRef = doc(db, "songs", id);
    await deleteDoc(songRef);
  };

  return { songs, loading, addSong, updateSong, deleteSong };
}
