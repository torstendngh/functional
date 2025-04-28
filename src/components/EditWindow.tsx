import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Card from "./Card";
import CheckIcon from "../icons/CheckIcon";
import CancelIcon from "../icons/CancelIcon";
import DeleteIcon from "../icons/DeleteIcon";
import { NoteType } from "../App";

interface EditWindowProps {
  note: NoteType;
  onSave: (id: number, content: string) => void;
  onCancel: () => void;
  onDelete: (id: number) => void;
}

function EditWindow({ note, onSave, onCancel, onDelete }: EditWindowProps) {
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setContent(note.content);
  }, [note]);

  const handleSave = () => {
    const trimmedContent = content.trim();
    if (trimmedContent && trimmedContent !== note.content) {
      onSave(note.id, trimmedContent);
    } else if (!trimmedContent) {
      alert("Note content cannot be empty.");
    } else {
      onCancel();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete note "${note.content.substring(0, 20)}..."?`)) {
      onDelete(note.id);
    }
  };

  return createPortal(
    <section className="absolute inset-0 bg-white p-4 gap-4 flex flex-col z-10">
      <Card className="flex-1 focus-within:outline-2 focus-within:outline-indigo-500">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="p-4 w-full h-full overflow-auto resize-none focus:outline-0 text-base caret-indigo-500"
          autoFocus
        ></textarea>
      </Card>
      <div className="flex gap-4 max-w-[800px] ml-auto w-full">
        <button
          className="bg-white rounded-full shadow-lg border-1 border-neutral-300 p-3 cursor-pointer hover:shadow-xl flex items-center justify-center gap-2 font-semibold text-red-600 hover:bg-red-50 transition-all"
          onClick={handleDelete}
          title="Delete Note"
        >
          <DeleteIcon />
        </button>
        <button
          className="bg-white rounded-full shadow-lg border-1 border-neutral-300 flex-1 p-3 cursor-pointer hover:shadow-xl flex items-center justify-center gap-2 font-semibold text-neutral-950 transition-all hover:bg-neutral-50"
          onClick={onCancel}
          title="Cancel Edit"
        >
          <CancelIcon />
          Cancel
        </button>
        <button
          className="bg-white rounded-full shadow-lg border-1 border-neutral-300 flex-1 p-3 cursor-pointer hover:shadow-xl flex items-center justify-center gap-2 font-semibold text-neutral-950 transition-all hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={!content.trim() || content === note.content}
          title="Save Changes"
        >
          <CheckIcon />
          Save
        </button>
      </div>
    </section>,
    document.body
  );
}

export default EditWindow;
