import { app, BrowserWindow, ipcMain, clipboard } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

const dbPath = path.join(app.getPath('userData'), 'notes.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const getNotesStmt = db.prepare('SELECT id, content FROM notes ORDER BY createdAt DESC');
const addNoteStmt = db.prepare('INSERT INTO notes (content) VALUES (?)');
const deleteNoteStmt = db.prepare('DELETE FROM notes WHERE id = ?');
const updateNoteStmt = db.prepare('UPDATE notes SET content = ? WHERE id = ?');

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
    autoHideMenuBar: true,
    width: 500,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

ipcMain.handle('db:get-notes', () => {
  try {
    return getNotesStmt.all();
  } catch (error) {
    console.error('Failed to get notes:', error);
    return [];
  }
});

ipcMain.handle('db:add-note', (_, content: string) => {
  if (!content?.trim()) {
    console.error('Attempted to add empty note');
    return null;
  }
  try {
    const info = addNoteStmt.run(content.trim());
    return { id: info.lastInsertRowid, content: content.trim() };
  } catch (error) {
    console.error('Failed to add note:', error);
    return null;
  }
});

ipcMain.handle('db:update-note', (_, id: number, content: string) => {
  if (!content?.trim()) {
    console.error('Attempted to update note with empty content', id);
    return null;
  }
  try {
    const info = updateNoteStmt.run(content.trim(), id);
    if (info.changes > 0) {
      return { id: id, content: content.trim() };
    } else {
      console.warn(`Note with id ${id} not found for update.`);
      return null;
    }
  } catch (error) {
    console.error('Failed to update note:', error);
    return null;
  }
});

ipcMain.handle('db:delete-note', (_, id: number) => {
  try {
    const info = deleteNoteStmt.run(id);
    return info.changes > 0;
  } catch (error) {
    console.error('Failed to delete note:', error);
    return false;
  }
});

ipcMain.handle('util:copy-to-clipboard', (_, text: string) => {
  clipboard.writeText(text);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close();
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)