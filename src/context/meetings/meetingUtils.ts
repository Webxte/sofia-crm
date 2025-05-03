
import { Meeting } from "@/types";
import { format } from "date-fns";

export const formatMeetingFromDatabase = (meeting: any): Meeting => {
  return {
    id: meeting.id,
    contactId: meeting.contact_id,
    contactName: meeting.contact_name,
    type: meeting.type,
    date: meeting.date,
    time: meeting.time,
    location: meeting.location || undefined,
    notes: meeting.notes || "",
    followUpScheduled: meeting.follow_up_scheduled,
    followUpDate: meeting.follow_up_date ? new Date(meeting.follow_up_date) : null,
    followUpTime: meeting.follow_up_time,
    followUpNotes: meeting.follow_up_notes,
    nextSteps: meeting.next_steps || [],
    agentId: meeting.agent_id,
    agentName: meeting.agent_name,
    organizationId: meeting.organization_id,
    createdAt: new Date(meeting.created_at),
    updatedAt: new Date(meeting.updated_at)
  };
};

export const formatMeetingForDatabase = (meeting: Partial<Meeting>) => {
  return {
    contact_id: meeting.contactId,
    contact_name: meeting.contactName,
    type: meeting.type,
    date: meeting.date,
    time: meeting.time,
    location: meeting.location,
    notes: meeting.notes,
    follow_up_scheduled: meeting.followUpScheduled || false,
    follow_up_date: meeting.followUpDate ? format(meeting.followUpDate, 'yyyy-MM-dd') : null,
    follow_up_time: meeting.followUpTime,
    follow_up_notes: meeting.followUpNotes,
    next_steps: meeting.nextSteps || [],
    agent_id: meeting.agentId,
    agent_name: meeting.agentName
  };
};

// Add these missing exports
export const supabaseToMeeting = formatMeetingFromDatabase;
export const meetingToSupabase = formatMeetingForDatabase;
export const newMeetingToSupabase = formatMeetingForDatabase;
