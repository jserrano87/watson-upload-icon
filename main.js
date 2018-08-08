const {app, BrowserWindow} = require('electron');

let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 560,
    icon: __dirname + '/assets/img/icon.ico'
  });
  mainWindow.setMenu(null);
  mainWindow.setMaximizable(false);
  mainWindow.setResizable(false);

  // Load the index.html of the app.
  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  })
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
