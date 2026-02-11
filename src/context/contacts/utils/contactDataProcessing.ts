
import { Contact } from "@/types";

// Define function to process contacts from Supabase response
export const processContacts = (data: any[]): Contact[] => {
  return data.map(item => ({
    id: item.id,
    fullName: item.full_name,
    email: item.email,
    phone: item.phone,
    mobile: item.mobile,
    address: item.address,
    company: item.company,
    position: item.position,
    source: item.source,
    category: item.category || "",
    agentId: item.agent_id,
    agentName: item.agent_name,
    notes: item.notes,
    organizationId: item.organization_id,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }));
};

// Map frontend model to database columns
export const contactToDbRecord = (contact: Partial<Contact>) => {
  const updates: any = {};
  
  if (contact.fullName !== undefined) updates.full_name = contact.fullName;
  if (contact.email !== undefined) updates.email = contact.email;
  if (contact.phone !== undefined) updates.phone = contact.phone;
  if (contact.mobile !== undefined) updates.mobile = contact.mobile;
  if (contact.address !== undefined) updates.address = contact.address;
  if (contact.company !== undefined) updates.company = contact.company;
  if (contact.position !== undefined) updates.position = contact.position;
  if (contact.source !== undefined) updates.source = contact.source;
  if (contact.category !== undefined) updates.category = contact.category;
  if (contact.agentId !== undefined) updates.agent_id = contact.agentId;
  if (contact.agentName !== undefined) updates.agent_name = contact.agentName;
  if (contact.notes !== undefined) updates.notes = contact.notes;
  if (contact.organizationId !== undefined) updates.organization_id = contact.organizationId;
  
  return updates;
};
