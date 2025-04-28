import { NoteType } from "../App";

interface KeyProps {
  note: NoteType;
  onEdit: (note: NoteType) => void;
  onCopy: (content: string) => void;
}

function Key({ note, onEdit, onCopy }: KeyProps) {
  const handleClick = () => {
    onCopy(note.content);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onEdit(note);
  };

  return (
    <button
      className="h-[44px] flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 text-neutral-950 rounded-lg font-semibold cursor-pointer text-lg"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={`Left-click to copy\nRight-click to edit`}
    >
      {note.content}
    </button>
  );
}

export default Key;
