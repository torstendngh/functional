import Card from "./Card";
import Note from "./Note";
import { NoteType } from "../App";
import LogoIcon from "../icons/LogoIcon";

interface NotesProps {
  notes: NoteType[];
  onEdit: (note: NoteType) => void;
  onCopy: (content: string) => void;
}

function Notes({ notes, onEdit, onCopy }: NotesProps) {
  return (
    <Card className="flex flex-col flex-1 overflow-auto p-2 gap-1">
      {notes.length === 0 && (
        <div className="text-neutral-200 text-center p-4 m-auto flex flex-col items-center gap-4">
          <LogoIcon />
          <span className="text-neutral-400 text-center">
            No notes yet.
            <br />
            Add one below!
          </span>
        </div>
      )}
      {notes.map((note) => (
        <Note key={note.id} note={note} onEdit={onEdit} onCopy={onCopy} />
      ))}
    </Card>
  );
}

export default Notes;
