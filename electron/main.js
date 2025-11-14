const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
  width: 1200,
  height: 700,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
  },
});

  const distPath = path.join(__dirname, '../frontend/dist/index.html');
  const isDev = !fs.existsSync(distPath);

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${distPath}`;

  mainWindow.loadURL(startUrl);

  // Убираем меню File Edit View Window Help
  Menu.setApplicationMenu(null);

  // Отключаем контекстное меню (правый клик)
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  if (isDev) {
    // mainWindow.webContents.openDevTools();
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});