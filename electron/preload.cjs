const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openFileInExplorer: (filepath) => ipcRenderer.invoke('open-file-in-explorer', filepath),
  playVideoFile: (filepath) => ipcRenderer.invoke('play-video-file', filepath),
  openFolderDirectory: (dirpath) => ipcRenderer.invoke('open-folder-directory', dirpath),
  selectFile: (filters) => ipcRenderer.invoke('select-file', filters),
  selectPoster: () => ipcRenderer.invoke('select-poster'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
});
