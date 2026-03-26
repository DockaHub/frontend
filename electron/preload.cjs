const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendNotification: (title, body) => {
        new Notification(title, { body });
    },
});
