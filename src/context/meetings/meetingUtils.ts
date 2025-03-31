
import { Meeting } from "@/types";
import { format } from "date-fns";

// Transform Supabase data to Meeting type
export const supabaseToMeeting = (meeting: any): Meeting => ({
  id: meeting.id,
  contactId: meeting.contact_id,
  type: meeting.type as "meeting" | "phone" | "email" | "online" | "other",
  date: new Date(meeting.date),
  time: meeting.time,
  location: meeting.location || "",
  notes: meeting.notes,
  followUpScheduled: meeting.follow_up_scheduled,
  followUpDate: meeting.follow_up_date ? new Date(meeting.follow_up_date) : null,
  followUpTime: meeting.follow_up_time || "",
  followUpNotes: meeting.follow_up_notes || "",
  nextSteps: meeting.next_steps || [],
  agentId: meeting.agent_id,
  agentName: meeting.agent_name,
  createdAt: new Date(meeting.created_at),
  updatedAt: new Date(meeting.updated_at),
});

// Transform Meeting type to Supabase format
export const meetingToSupabase = (meetingData: Partial<Meeting>) => {
  const updateData: any = {};
  
  if (meetingData.contactId !== undefined) updateData.contact_id = meetingData.contactId;
  if (meetingData.type !== undefined) updateData.type = meetingData.type;
  if (meetingData.date !== undefined) updateData.date = format(meetingData.date, 'yyyy-MM-dd');
  if (meetingData.time !== undefined) updateData.time = meetingData.time;
  if (meetingData.location !== undefined) updateData.location = meetingData.location;
  if (meetingData.notes !== undefined) updateData.notes = meetingData.notes;
  if (meetingData.followUpScheduled !== undefined) updateData.follow_up_scheduled = meetingData.followUpScheduled;
  if (meetingData.followUpDate !== undefined) updateData.follow_up_date = meetingData.followUpDate ? format(meetingData.followUpDate, 'yyyy-MM-dd') : null;
  if (meetingData.followUpTime !== undefined) updateData.follow_up_time = meetingData.followUpTime;
  if (meetingData.followUpNotes !== undefined) updateData.follow_up_notes = meetingData.followUpNotes;
  if (meetingData.nextSteps !== undefined) updateData.next_steps = meetingData.nextSteps;
  
  return updateData;
};

// Convert new meeting data to Supabase format
export const newMeetingToSupabase = (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">, agentData: { agent_id: string; agent_name: string }) => {
  return {
    contact_id: meetingData.contactId,
    type: meetingData.type,
    date: format(meetingData.date, 'yyyy-MM-dd'),
    time: meetingData.time,
    location: meetingData.location,
    notes: meetingData.notes,
    follow_up_scheduled: meetingData.followUpScheduled,
    follow_up_date: meetingData.followUpDate ? format(meetingData.followUpDate, 'yyyy-MM-dd') : null,
    follow_up_time: meetingData.followUpTime,
    follow_up_notes: meetingData.followUpNotes,
    next_steps: meetingData.nextSteps,
    ...agentData
  };
};
