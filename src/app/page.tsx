"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMembers } from "@/hooks/useMembers";
import { useSongs } from "@/hooks/useSongs";
import { usePerformances } from "@/hooks/usePerformances";
import { useAssignments } from "@/hooks/useAssignments";
import { useAvailability } from "@/hooks/useAvailability";
import { motion, AnimatePresence } from "framer-motion";
import { HuddleLayout } from "@/components/layout/HuddleLayout";
import { HuddleMasterCommand } from "@/components/HuddleMasterCommand";
import { PersonnelSection } from "@/components/PersonnelSection";
import { RepertoireSection } from "@/components/RepertoireSection";
import { PerformancesSection } from "@/components/PerformancesSection";
import { MatrixSection } from "@/components/MatrixSection";
import { TabId } from "@/components/Sidebar";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("master");
  
  // Data hooks
  const { members, addMember, deleteMember } = useMembers();
  const { songs, addSong, deleteSong } = useSongs();
  const { performances, addPerformance, deletePerformance, updatePerformance } = usePerformances();
  
  // Matrix specific state
  const [filterPerfId, setFilterPerfId] = useState("");
  const [filterSongId, setFilterSongId] = useState("");

  const { assignments, assignMember, removeAssignment } = useAssignments(filterPerfId);
  const { availability, updateAvailability } = useAvailability(filterPerfId);

  // Even if auth is loading, we can show the app since we're allowing public access
  // But we'll wait for hooks to avoid flicker if we want. 
  // For now, let's keep it simple.

  const renderSection = () => {
    switch (activeTab) {
      case "master":
        return (
          <HuddleMasterCommand 
            members={members}
            songs={songs}
            performances={performances}
            availability={availability}
            updateAvailability={updateAvailability}
            addMember={addMember}
            addSong={addSong}
            filterPerfId={filterPerfId}
            setFilterPerfId={setFilterPerfId}
            filterSongId={filterSongId}
            setFilterSongId={setFilterSongId}
            onTabChange={setActiveTab}
            assignments={assignments}
            removeAssignment={removeAssignment}
          />
        );
      case "personnel":
        return <PersonnelSection members={members} addMember={addMember} deleteMember={deleteMember} />;
      case "repertoire":
        return <RepertoireSection songs={songs} members={members} addSong={addSong} deleteSong={deleteSong} />;
      case "performances":
        return (
          <PerformancesSection 
            performances={performances} 
            songs={songs} 
            members={members}
            availabilityMap={availability}
            addPerformance={addPerformance} 
            deletePerformance={deletePerformance}
            updatePerformance={updatePerformance}
            updateAvailability={updateAvailability}
            assignMember={assignMember}
          />
        );
      case "matrix":
        return (
          <MatrixSection 
            members={members}
            songs={songs}
            performances={performances}
            assignments={assignments}
            availabilityMap={availability}
            filterPerfId={filterPerfId}
            setFilterPerfId={setFilterPerfId}
            filterSongId={filterSongId}
            setFilterSongId={setFilterSongId}
            removeAssignment={removeAssignment}
          />
        );
      default:
        return (
          <HuddleMasterCommand 
            members={members}
            songs={songs}
            performances={performances}
            availability={availability}
            updateAvailability={updateAvailability}
            addMember={addMember}
            addSong={addSong}
            filterPerfId={filterPerfId}
            setFilterPerfId={setFilterPerfId}
            filterSongId={filterSongId}
            setFilterSongId={setFilterSongId}
            onTabChange={setActiveTab}
            assignments={assignments}
            removeAssignment={removeAssignment}
          />
        );
    }
  };

  const userInitials = user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase() || "HP";

  return (
    <HuddleLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      userInitials={userInitials}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {renderSection()}
        </motion.div>
      </AnimatePresence>
    </HuddleLayout>
  );
}
