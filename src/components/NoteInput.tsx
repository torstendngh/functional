import { useState, useRef, useLayoutEffect } from "react";
import SendIcon from "../icons/SendIcon";

interface NoteInputProps {
  onAddNote: (content: string) => void;
}

function NoteInput({ onAddNote }: NoteInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [inputValue]);

  const saveNote = () => {
    const content = inputValue.trim();
    if (content) {
      onAddNote(content);
      setInputValue("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveNote();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl flex focus-within:outline-2 focus-within:outline-indigo-500 shadow-lg border border-neutral-300"
    >
      <div className="flex flex-1">
        <textarea
          ref={textareaRef}
          rows={1}
          autoFocus
          placeholder="Add a new note or character..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`w-full px-6 py-3 placeholder:text-neutral-400 text-neutral-950 focus:border-0 focus:outline-0 text-base caret-indigo-500 resize-none overflow-y-auto place-content-center`}
          style={{
            minHeight: "3rem",
            maxHeight: "9rem",
            height: "auto",
          }}
        ></textarea>
      </div>
      <button
        type="submit"
        className="flex items-center justify-center p-3 m-1.5 rounded-full cursor-pointer text-indigo-500 hover:bg-neutral-100 active:bg-neutral-200 ml-0 disabled:text-neutral-400 disabled:cursor-not-allowed self-end"
        disabled={!inputValue.trim()}
        title="Add Note (Enter)"
      >
        <SendIcon />
      </button>
    </form>
  );
}

export default NoteInput;
