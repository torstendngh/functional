import Card from "./Card";
import Key from "./Key";
import { NoteType } from "../App";

interface KeysProps {
  notes: NoteType[];
  onEdit: (note: NoteType) => void;
  onCopy: (content: string) => void;
}

function Keys({ notes, onEdit, onCopy }: KeysProps) {
  return (
    <Card className="p-2 grid gap-2 grid-cols-[repeat(auto-fill,_minmax(44px,_1fr))] max-h-[33%] overflow-auto">
      {notes.map((note) => (
        <Key key={note.id} note={note} onEdit={onEdit} onCopy={onCopy} />
      ))}
    </Card>
  );
}

export default Keys;
