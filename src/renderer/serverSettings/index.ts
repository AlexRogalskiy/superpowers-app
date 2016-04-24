import * as fs from "fs";
import * as electron from "electron";
import * as settings from "../settings";

import "./systems";
import "./log";

const settingsElt = document.querySelector(".server-settings") as HTMLDivElement;

const mainPortElt = settingsElt.querySelector(".main-port input") as HTMLInputElement;
const buildPortElt = settingsElt.querySelector(".build-port input") as HTMLInputElement;
const autoStartServerElt = settingsElt.querySelector("#auto-start-server-checkbox") as HTMLInputElement;

const openProjectsFolderElt = settingsElt.querySelector(".projects-folder button") as HTMLButtonElement;
const maxRecentBuildsElt = settingsElt.querySelector(".max-recent-builds input") as HTMLInputElement;

export function start() {
  const serverConfig = getServerConfig();
  if (serverConfig == null) {
    (settingsElt.querySelector(".error") as HTMLElement).hidden = false;
    (settingsElt.querySelector(".settings") as HTMLElement).hidden = true;
    (settingsElt.querySelector(".systems") as HTMLElement).hidden = true;
    return;
  }

  mainPortElt.value = serverConfig.mainPort.toString();
  buildPortElt.value = serverConfig.buildPort.toString();
  maxRecentBuildsElt.value = serverConfig.maxRecentBuilds.toString();

  autoStartServerElt.checked = settings.autoStartServer;
  autoStartServerElt.addEventListener("change", onChangeAutoStartServer);

  openProjectsFolderElt.addEventListener("click", onOpenProjectsFolderClick);
}

interface ServerConfig {
  mainPort: number;
  buildPort: number;
  maxRecentBuilds: number;
  [key: string]: any;
}
function getServerConfig() {
  let defaultConfig: ServerConfig;
  try {
    /* tslint:disable */
    defaultConfig = require(`${settings.corePath}/server/config.js`).defaults;
    /* tslint:enable */
  } catch (err) {
    return null;
  }

  let localConfig: ServerConfig;
  try {
    localConfig = JSON.parse(fs.readFileSync(`${settings.userDataPath}/config.json`, { encoding: "utf8" }));
  } catch (err) { /* Ignore */ }
  if (localConfig == null) localConfig = {} as any;

  const config: ServerConfig = {} as any;
  for (const key in defaultConfig) {
    if (localConfig[key] != null) config[key] = localConfig[key];
    else config[key] = defaultConfig[key];
  }

  return config;
}

function onOpenProjectsFolderClick() {
  electron.shell.showItemInFolder(`${settings.userDataPath}/projects`);
}

function onChangeAutoStartServer() {
  settings.autoStartServer = autoStartServerElt.checked;
  settings.scheduleSave();
}
