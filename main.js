const electron = require("electron");
const protocol = electron.protocol;

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let deeplinkingUrl;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, argv, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    if (process.platform == "win32") {
      deeplinkingUrl = argv.slice(1);
    }
    logEverywhere("app.requestSingleInstanceLock# " + deeplinkingUrl);
  });

  // Create mainWindow, load the rest of the app, etc...
  app.on("ready", () => {});
  app.on("will-finish-launching", () => {
    // Protocol handler for osx
    logEverywhere("argv" + process.argv.slice(1));
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // let menu = electron.Menu.buildFromTemplate([
  //   {
  //     label: "Menu",
  //     submenu: [{ role: "quit" }]
  //   },
  //   {
  //     label: "Edit",
  //     submenu: [
  //       { role: "undo" },
  //       { role: "redo" },
  //       { type: "separator" },
  //       { role: "cut" },
  //       { role: "copy" },
  //       { role: "paste" },
  //       { role: "pasteandmatchstyle" },
  //       { role: "delete" },
  //       { role: "selectall" }
  //     ]
  //   },
  //   {
  //     label: "Developer",
  //     submenu: [
  //       { role: "reload" },
  //       { role: "forceReload" },
  //       { role: "toggleDevTools" }
  //     ]
  //   }
  // ]);
  // electron.Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var link;
app.on("open-url", function(event, data) {
  event.preventDefault();
  link = data;
  console.log("Link Open");
});
app.setAsDefaultProtocolClient("sdcast");

// Log both at dev console and at running node console instance
function logEverywhere(s) {
  console.log(s);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
  }
}

module.exports.getLink = () => link;
module.exports.getApp = () => app;
module.exitApp = () => app.exit(0);
