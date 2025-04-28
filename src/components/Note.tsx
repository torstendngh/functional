import { NoteType } from "../App";

interface NoteProps {
  note: NoteType;
  onEdit: (note: NoteType) => void;
  onCopy: (content: string) => void;
}

function Note({ note, onEdit, onCopy }: NoteProps) {
  const handleClick = () => {
    onCopy(note.content);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onEdit(note);
  };

  return (
    <button
      className="flex text-left w-full px-4 py-3 cursor-pointer hover:bg-neutral-100 active:bg-neutral-200 text-neutral-950 rounded-lg text-base whitespace-pre"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={`Left-click to copy\nRight-click to edit`}
    >
      {note.content}
    </button>
  );
}

export default Note;
