const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    awaitWriteFinish: true,
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false,
      // webSecurity: false
    }
  });
  app.commandLine.appendSwitch('enable-features', 'WebSpeechAPI');

  if (isDev) {
    win.webContents.openDevTools(); // Open DevTools for debugging
  }

  const appURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, './build/index.html')}`;
  win.loadURL(appURL);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
