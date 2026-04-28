import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Contact, PipelineStage } from "@/types";
import { PipelineColumn } from "./PipelineColumn";
import { PipelineCard } from "./PipelineCard";
import { useContacts } from "@/context/ContactsContext";

export const PIPELINE_STAGES: PipelineStage[] = [
  "lead",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
];

interface PipelineBoardProps {
  contacts: Contact[];
}

export const PipelineBoard = ({ contacts }: PipelineBoardProps) => {
  const { updateContact } = useContacts();
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [overStage, setOverStage] = useState<PipelineStage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    })
  );

  const groupedContacts = PIPELINE_STAGES.reduce<Record<PipelineStage, Contact[]>>(
    (acc, stage) => {
      acc[stage] = contacts.filter((c) => (c.pipelineStage || "lead") === stage);
      return acc;
    },
    {} as Record<PipelineStage, Contact[]>
  );

  const handleDragStart = (event: DragStartEvent) => {
    const contact = contacts.find((c) => c.id === event.active.id);
    setActiveContact(contact || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as PipelineStage | null;
    setOverStage(overId);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveContact(null);
    setOverStage(null);

    if (!over) return;

    const contactId = active.id as string;
    const newStage = over.id as PipelineStage;
    const contact = contacts.find((c) => c.id === contactId);

    if (!contact || contact.pipelineStage === newStage) return;

    // Auto-promote to customer when moved to Won
    const newContactType =
      newStage === "won"
        ? "customer"
        : newStage === "lost"
        ? contact.contactType
        : contact.contactType;

    await updateContact(contactId, {
      pipelineStage: newStage,
      contactType: newContactType,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage}
            stage={stage}
            contacts={groupedContacts[stage]}
            isOver={overStage === stage}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeContact ? <PipelineCard contact={activeContact} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
