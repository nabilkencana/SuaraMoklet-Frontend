import React from "react";
import { Complaint, TimelineEvent } from "@/types/complaint";
import SupportWidget from "@/components/complaints/SupportWidget";
import Timeline from "@/components/complaints/Timeline";
import RatingWidget from "@/components/complaints/RatingWidget";

interface ComplaintSidebarProps {
  complaint: Complaint;
  isOwner: boolean;
  displayTimeline: TimelineEvent[];
  onSupport: (id: string, name?: string, comment?: string) => Promise<boolean>;
}

export default function ComplaintSidebar({
  complaint,
  isOwner,
  displayTimeline,
  onSupport,
}: ComplaintSidebarProps) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {complaint.visibility === "PUBLIC" && (
        <SupportWidget
          complaintId={complaint.id}
          supports={complaint.supports}
          isSupported={complaint.isSupported}
          isOwner={isOwner}
          onSupport={onSupport}
        />
      )}

      <Timeline events={displayTimeline} />

      {/* Rating: only show to complaint owner after status DONE */}
      {isOwner && complaint.status === "DONE" && (
        <RatingWidget
          complaintId={complaint.id}
          existingRating={complaint.rating}
        />
      )}
    </div>
  );
}
