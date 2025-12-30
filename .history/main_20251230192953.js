const { app, BrowserWindow } = require('electron');
const path = require('path');

// Optional: start backend server automatically
// Make sure your server.js listens on a fixed port, e.g., 3000
const backend = require('./backend/index.js');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load frontend correctly for both dev and packaged app
  const startUrl = path.join(__dirname, 'frontend', 'index.html');
  win.loadURL(`file://${startUrl}`);

  // Optional: open dev tools for debugging
  // win.webContents.openDevTools();
}

// Electron app events
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
