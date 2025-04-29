import { useState, useEffect, useCallback } from "react";
import Keys from "./components/Keys";
import NoteInput from "./components/NoteInput";
import Notes from "./components/Notes";
import EditWindow from "./components/EditWindow";
import { useNotification } from "./components/NotificationContext";

export interface NoteType {
  id: number;
  content: string;
}

export default function App() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [editingNote, setEditingNote] = useState<NoteType | null>(null);
  const notify = useNotification();

  const fetchNotes = useCallback(async () => {
    try {
      const fetchedNotes = await window.electronAPI.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      notify({
        type: "warning",
        message: "Could not load notes",
        duration: 4000,
      });
    }
  }, [notify]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = useCallback(
    async (content: string) => {
      try {
        const newNote = await window.electronAPI.addNote(content);
        if (newNote) {
          fetchNotes();
          notify({ type: "success", message: "Note added", duration: 3000 });
        }
      } catch (error) {
        console.error("Failed to add note:", error);
        notify({
          type: "warning",
          message: "Failed to add note",
          duration: 5000,
        });
      }
    },
    [fetchNotes, notify]
  );

  const handleUpdateNote = useCallback(
    async (id: number, content: string) => {
      try {
        const updatedNote = await window.electronAPI.updateNote(id, content);
        if (updatedNote) {
          setNotes((prev) =>
            prev.map((note) =>
              note.id === id ? { ...note, content: updatedNote.content } : note
            )
          );
          setEditingNote(null);
          notify({ type: "success", message: "Note updated", duration: 3000 });
        } else {
          console.error(
            "Failed to update note on frontend, backend returned null"
          );
          notify({
            type: "warning",
            message: "Update failed",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Failed to update note:", error);
        notify({
          type: "warning",
          message: "Error updating note",
          duration: 5000,
        });
      }
    },
    [notify]
  );

  const handleDeleteNote = useCallback(
    async (id: number) => {
      try {
        const deleted = await window.electronAPI.deleteNote(id);
        if (deleted) {
          setNotes((prev) => prev.filter((note) => note.id !== id));
          setEditingNote(null);
          notify({ type: "success", message: "Note deleted", duration: 3000 });
        } else {
          console.error(
            "Failed to delete note on frontend, backend returned false"
          );
          notify({
            type: "warning",
            message: "Delete failed",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Failed to delete note:", error);
        notify({
          type: "warning",
          message: "Error deleting note",
          duration: 5000,
        });
      }
    },
    [notify]
  );

  const handleCopyToClipboard = useCallback(
    async (text: string) => {
      try {
        await window.electronAPI.copyToClipboard(text);
        notify({
          type: "success",
          message: "Copied to clipboard!",
          duration: 2000,
        });
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        notify({ type: "warning", message: "Copy failed", duration: 4000 });
      }
    },
    [notify]
  );

  const handleOpenEditWindow = useCallback(
    (note: NoteType) => setEditingNote(note),
    []
  );
  const handleCloseEditWindow = useCallback(() => setEditingNote(null), []);

  return (
    <main className="bg-white h-full w-full flex-1 p-4 gap-4 flex flex-col">
      {notes.filter((n) => n.content.length <= 2).length > 0 && (
        <Keys
          notes={notes.filter((n) => n.content.length <= 2)}
          onEdit={handleOpenEditWindow}
          onCopy={handleCopyToClipboard}
        />
      )}
      <Notes
        notes={notes.filter((n) => n.content.length > 2)}
        onEdit={handleOpenEditWindow}
        onCopy={handleCopyToClipboard}
      />
      <NoteInput onAddNote={handleAddNote} />
      {editingNote && (
        <EditWindow
          note={editingNote}
          onSave={handleUpdateNote}
          onCancel={handleCloseEditWindow}
          onDelete={handleDeleteNote}
        />
      )}
    </main>
  );
}
