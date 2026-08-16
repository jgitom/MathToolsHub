// One-off smoke test: launch the packaged app, verify the renderer boots cleanly.
const { app, BrowserWindow } = require("electron");
const path = require("node:path");

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 400, height: 300, show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  const rendererErrors = [];
  win.webContents.on("console-message", (_e, level, message) => {
    if (level >= 2) rendererErrors.push(message);
  });
  win.webContents.on("did-fail-load", (_e, code, desc) => {
    console.log("DID_FAIL_LOAD:", code, desc);
    app.exit(1);
  });
  win.webContents.on("did-finish-load", async () => {
    await new Promise(r => setTimeout(r, 1500));
    try {
      const appEl = await win.webContents.executeJavaScript(`!!document.querySelector('.app')`);
      const desktop = await win.webContents.executeJavaScript(`!!window.desktopAPI`);
      const desktopVer = await win.webContents.executeJavaScript(`window.desktopAPI ? window.desktopAPI.version : null`);
      const title = await win.webContents.executeJavaScript(`document.title`);
      console.log("APP_LOADED:", appEl);
      console.log("DESKTOP_API:", desktop);
      console.log("DESKTOP_VER:", desktopVer);
      console.log("TITLE:", title);
      console.log("RENDERER_ERRORS:", rendererErrors.length ? JSON.stringify(rendererErrors) : "none");
      app.exit(appEl && desktop ? 0 : 1);
    } catch (e) {
      console.log("SMOKE_ERROR:", e.message);
      app.exit(1);
    }
  });
  win.loadFile("index.html");
});
