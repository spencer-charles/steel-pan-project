"use client";

import { useState } from "react";
import { useCurrentMember } from "@/context/CurrentMemberContext";
import { IdentityGate } from "@/components/IdentityGate";
import { ConnectionBanner, ErrorBanner, SectionSkeleton } from "@/components/DataState";
import { useMembers } from "@/hooks/useMembers";
import { useSongs } from "@/hooks/useSongs";
import { usePerformances } from "@/hooks/usePerformances";
import { useAssignments } from "@/hooks/useAssignments";
import { useAvailability } from "@/hooks/useAvailability";
import { HuddleLayout } from "@/components/layout/HuddleLayout";
import { HuddleMasterCommand } from "@/components/HuddleMasterCommand";
import { PersonnelSection } from "@/components/PersonnelSection";
import { RepertoireSection } from "@/components/RepertoireSection";
import { PerformancesSection } from "@/components/PerformancesSection";
import { MatrixSection } from "@/components/MatrixSection";
import { TabId, DEFAULT_COVERAGE_ID } from "@/lib/constants";

export default function Home() {
  const { currentMemberId, isReady, clearMember } = useCurrentMember();
  const [activeTab, setActiveTab] = useState<TabId>("master");

  // Data hooks
  const { members, loading: membersLoading, error: membersError, addMember, deleteMember } = useMembers();
  const { songs, loading: songsLoading, error: songsError, addSong, deleteSong } = useSongs();
  const { performances, loading: perfLoading, error: perfError, addPerformance, deletePerformance, updatePerformance } = usePerformances();

  // Matrix specific state
  const [filterPerfId, setFilterPerfId] = useState("");
  const [filterSongId, setFilterSongId] = useState("");

  const { assignments, removeAssignment } = useAssignments(filterPerfId);
  const { assignments: defaultAssignments } = useAssignments(DEFAULT_COVERAGE_ID);
  const { availability, allAvailability, error: availError, updateAvailability } = useAvailability(filterPerfId);

  // The roster is public and fully editable by everyone by design — identity is
  // only about knowing whose availability a tap should write.
  const currentMember = members.find(m => m.id === currentMemberId) ?? null;

  const dataError = membersError || perfError || availError || songsError;
  const isLoading = membersLoading || perfLoading || songsLoading;

  const renderSection = () => {
    switch (activeTab) {
      case "personnel":
        return <PersonnelSection members={members} addMember={addMember} deleteMember={deleteMember} />;
      case "repertoire":
        return <RepertoireSection songs={songs} members={members} addSong={addSong} deleteSong={deleteSong} />;
      case "performances":
        return (
          <PerformancesSection
            performances={performances}
            songs={songs}
            addPerformance={addPerformance}
            deletePerformance={deletePerformance}
            updatePerformance={updatePerformance}
          />
        );
      case "matrix":
        return (
          <MatrixSection 
            members={members}
            songs={songs}
            performances={performances}
            assignments={assignments}
            defaultAssignments={defaultAssignments}
            availabilityMap={availability}
            filterPerfId={filterPerfId}
            setFilterPerfId={setFilterPerfId}
            filterSongId={filterSongId}
            setFilterSongId={setFilterSongId}
            removeAssignment={removeAssignment}
          />
        );
      // "master" and any unhandled tab both land on the dashboard.
      default:
        return (
          <HuddleMasterCommand
            members={members}
            performances={performances}
            allAvailability={allAvailability}
            updateAvailability={updateAvailability}
            onTabChange={setActiveTab}
            updatePerformance={updatePerformance}
            currentMemberId={currentMemberId}
          />
        );
    }
  };

  // Wait for localStorage before deciding, so returning users never see the picker.
  if (!isReady) return null;

  if (!currentMemberId || (!membersLoading && !currentMember)) {
    return <IdentityGate members={members} loading={membersLoading} addMember={addMember} />;
  }

  return (
    <HuddleLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentMemberName={currentMember?.name ?? null}
      onSwitchMember={clearMember}
    >
      <ConnectionBanner />
      {dataError && <ErrorBanner message={dataError} />}
      {/* Deliberately not wrapped in AnimatePresence: a JS-driven transition
          here gates *all* content behind an animation completing, and each
          section already has its own CSS entrance. */}
      <div key={activeTab}>
        {isLoading && !dataError ? <SectionSkeleton /> : renderSection()}
      </div>
    </HuddleLayout>
  );
}
