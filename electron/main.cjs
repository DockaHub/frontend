const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

Menu.setApplicationMenu(null);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
        },
        icon: path.join(__dirname, '../public/favicon.ico'),
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#0f172a', // Cor de fundo que combina com seu Dashboard (Slate 900)
            symbolColor: '#f8f9fa', // Cor dos ícones (branco)
            height: 32
        }
    });

    // Ajustado para porta 3000 do seu Vite
    const startURL = isDev
        ? 'http://127.0.0.1:3000'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    win.loadURL(startURL);

    if (isDev) {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
