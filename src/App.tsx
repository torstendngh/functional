import { useState, useEffect, useCallback } from "react";
import Keys from "./components/Keys";
import NoteInput from "./components/NoteInput";
import Notes from "./components/Notes";
import EditWindow from "./components/EditWindow";

export interface NoteType {
  id: number;
  content: string;
}

function App() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [editingNote, setEditingNote] = useState<NoteType | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const fetchedNotes = await window.electronAPI.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = useCallback(
    async (content: string) => {
      try {
        const newNote = await window.electronAPI.addNote(content);
        if (newNote) {
          fetchNotes();
        }
      } catch (error) {
        console.error("Failed to add note:", error);
      }
    },
    [fetchNotes]
  );

  const handleUpdateNote = useCallback(async (id: number, content: string) => {
    try {
      const updatedNote = await window.electronAPI.updateNote(id, content);
      if (updatedNote) {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === id ? { ...note, content: updatedNote.content } : note
          )
        );
        setEditingNote(null);
      } else {
        console.error(
          "Failed to update note on frontend, backend returned null"
        );
      }
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  }, []);

  const handleDeleteNote = useCallback(async (id: number) => {
    try {
      const deleted = await window.electronAPI.deleteNote(id);
      if (deleted) {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        setEditingNote(null);
      } else {
        console.error(
          "Failed to delete note on frontend, backend returned false"
        );
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }, []);

  const handleCopyToClipboard = useCallback(async (text: string) => {
    try {
      await window.electronAPI.copyToClipboard(text);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, []);

  const handleOpenEditWindow = useCallback((note: NoteType) => {
    setEditingNote(note);
  }, []);

  const handleCloseEditWindow = useCallback(() => {
    setEditingNote(null);
  }, []);

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

export default App;
