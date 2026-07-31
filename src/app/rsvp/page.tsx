"use client";

import { Suspense } from "react";
import RsvpClient from "./[id]/RsvpClient";
import { SectionSkeleton } from "@/components/DataState";

export default function RsvpIndexPage() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <RsvpClient />
    </Suspense>
  );
}
