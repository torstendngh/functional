/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string
    VITE_PUBLIC: string
  }
}

interface Window {
  electronAPI: {
    getNotes: () => Promise<{ id: number; content: string }[]>;
    addNote: (content: string) => Promise<{ id: number; content: string } | null>;
    updateNote: (id: number, content: string) => Promise<{ id: number; content: string } | null>;
    deleteNote: (id: number) => Promise<boolean>;
    copyToClipboard: (text: string) => Promise<void>;
  };
}
