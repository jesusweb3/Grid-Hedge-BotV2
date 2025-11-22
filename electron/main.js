const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const APP_TITLE = 'Grid-Hedge-Bot';
app.setName(APP_TITLE);

let mainWindow;

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 830,
    title: APP_TITLE,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const prodIndexPath = path.join(__dirname, '../frontend/dist/index.html');
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  const startUrl = isDev
    ? devServerUrl
    : `file://${prodIndexPath}`;

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