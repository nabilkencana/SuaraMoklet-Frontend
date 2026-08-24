import React from "react";
import { Complaint, TimelineEvent } from "@/types/complaint";
import SupportWidget from "@/components/complaints/SupportWidget";
import Timeline from "@/components/complaints/Timeline";
import RatingWidget from "@/components/complaints/RatingWidget";

interface ComplaintSidebarProps {
  complaint: Complaint;
  isOwner: boolean;
  source?: string | null;
  displayTimeline: TimelineEvent[];
  onSupport: (id: string, action: 'LIKE' | 'UNLIKE' | 'DISLIKE' | 'UNDISLIKE') => Promise<{ supports: number, dislikes: number } | null>;
}

export default function ComplaintSidebar({
  complaint,
  isOwner,
  source,
  displayTimeline,
  onSupport,
}: ComplaintSidebarProps) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {complaint.visibility === "PUBLIC" && (
        <SupportWidget
          complaintId={complaint.id}
          supports={complaint.supports}
          dislikes={complaint.dislikes}
          isSupported={complaint.isSupported}
          isDisliked={complaint.isDisliked}
          isOwner={isOwner}
          onSupport={onSupport}
        />
      )}

      {/* Timeline: only show to complaint owner if they accessed from my-complaints */}
      {isOwner && source === "my-complaints" && <Timeline events={displayTimeline} />}

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
