import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, CheckSquare, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useContacts } from "@/context/contacts/ContactsContext";
import { useOrders } from "@/context/orders/OrdersContext";
import { useTasks } from "@/context/tasks";
import { useMeetings } from "@/context/meetings";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { contacts } = useContacts();
  const { orders } = useOrders();
  const { tasks } = useTasks();
  const { meetings } = useMeetings();

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const q = query.toLowerCase().trim();

  const matchedContacts = useMemo(() => {
    if (!q) return [];
    return contacts
      .filter(c =>
        c.fullName?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [contacts, q]);

  const matchedOrders = useMemo(() => {
    if (!q) return [];
    return orders
      .filter(o =>
        o.reference?.toLowerCase().includes(q) ||
        o.contactCompany?.toLowerCase().includes(q) ||
        o.contactFullName?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [orders, q]);

  const matchedTasks = useMemo(() => {
    if (!q) return [];
    return tasks
      .filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [tasks, q]);

  const matchedMeetings = useMemo(() => {
    if (!q) return [];
    return meetings
      .filter(m =>
        m.contactName?.toLowerCase().includes(q) ||
        m.notes?.toLowerCase().includes(q) ||
        m.type?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [meetings, q]);

  const hasResults =
    matchedContacts.length > 0 ||
    matchedOrders.length > 0 ||
    matchedTasks.length > 0 ||
    matchedMeetings.length > 0;

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2 text-muted-foreground w-48 justify-between"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5" />
          <span className="text-sm">Search…</span>
        </span>
        <kbd className="pointer-events-none text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden h-8 w-8"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search contacts, orders, tasks, meetings…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {q && !hasResults && <CommandEmpty>No results found.</CommandEmpty>}

          {!q && (
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              Start typing to search across all records.
            </CommandEmpty>
          )}

          {matchedContacts.length > 0 && (
            <CommandGroup heading="Contacts">
              {matchedContacts.map(c => (
                <CommandItem
                  key={c.id}
                  value={`contact-${c.id}`}
                  onSelect={() => go(`/contacts/${c.id}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate">{c.company || c.fullName || "—"}</p>
                    {c.company && c.fullName && (
                      <p className="text-xs text-muted-foreground truncate">{c.fullName}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {matchedContacts.length > 0 && matchedOrders.length > 0 && <CommandSeparator />}

          {matchedOrders.length > 0 && (
            <CommandGroup heading="Orders">
              {matchedOrders.map(o => (
                <CommandItem
                  key={o.id}
                  value={`order-${o.id}`}
                  onSelect={() => go(`/orders/${o.id}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate">
                      {o.reference || `#${o.id.slice(0, 8).toUpperCase()}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {o.contactCompany || o.contactFullName || "—"} · {o.status}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {matchedOrders.length > 0 && matchedTasks.length > 0 && <CommandSeparator />}

          {matchedTasks.length > 0 && (
            <CommandGroup heading="Tasks">
              {matchedTasks.map(t => (
                <CommandItem
                  key={t.id}
                  value={`task-${t.id}`}
                  onSelect={() => go(`/tasks/${t.id}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.priority} priority · {t.status}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {matchedTasks.length > 0 && matchedMeetings.length > 0 && <CommandSeparator />}

          {matchedMeetings.length > 0 && (
            <CommandGroup heading="Meetings">
              {matchedMeetings.map(m => (
                <CommandItem
                  key={m.id}
                  value={`meeting-${m.id}`}
                  onSelect={() => go(`/meetings/${m.id}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate">{m.contactName || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.type} · {m.date}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
