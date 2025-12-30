const { app, BrowserWindow } = require('electron');
const path = require('path');

// Optional: start backend server automatically
// require('./backend/server.js');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,      // allow Node.js in frontend
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, '../')); // load your website
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
