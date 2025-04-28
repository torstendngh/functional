import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getNotes: (): Promise<{ id: number; content: string }[]> => ipcRenderer.invoke('db:get-notes'),
  addNote: (content: string): Promise<{ id: number; content: string } | null> => ipcRenderer.invoke('db:add-note', content),
  updateNote: (id: number, content: string): Promise<{ id: number; content: string } | null> => ipcRenderer.invoke('db:update-note', id, content),
  deleteNote: (id: number): Promise<boolean> => ipcRenderer.invoke('db:delete-note', id),
  copyToClipboard: (text: string): Promise<void> => ipcRenderer.invoke('util:copy-to-clipboard', text),
})
