import Updater from "./updater";
import {Config} from "data";
import Utilities from "./utilities";
import {React} from "modules";
import SettingItem from "../ui/settings/components/item";
import Tick from "../ui/icons/tick";

const request = require("request");

export default new class SettingsUpdater {
    get urls() {
        return [
            {
                name: "Core",
                currentVersion: Config.bdVersion,
                updateUrl: "aaaa",
                versionProp: "version"
            },
            {
                name: "Injector",
                currentVersion: Config.version,
                updateUrl: "",
                versionProp: "version"
            }
        ];
    }

    compareVersions(oldVersion, newVersion) {
        const oldNumbers = oldVersion.split(".").map(e => parseInt(e));
        const newNumbers = newVersion.split(".").map(e => parseInt(e));
        return newNumbers.some((value, index) => value > oldNumbers[index]);
    }

    initialize() {
        this.registerUpdater();
    }

    async checkForUpdates() {
        const updatesFound = [];

        for (const update of this.urls) {
            if (!update.updateUrl) continue;
            
            const remoteVersion = await new Promise(resolve => {
                return resolve("1.0.1");
                request.get({url: update.updateUrl, json: true}, (error, res, body) => {
                    if (!error && res.statusCode == 200) return resolve(Utilities.getNestedProp(body, update.versionProp));
                    resolve(update.currentVersion);
                });
            });

            if (this.compareVersions(update.currentVersion, remoteVersion)) updatesFound.push({name: update.name, newVersion: remoteVersion});
        }
        return updatesFound;
    }

    doUpdate() {
        // TODO: handle this
    }

    registerUpdater() {
        Updater.registerService({
            name: "BetterDiscord",
            id: "betterdiscord",
            interval: 18e+6,
            handler: this.checkForUpdates.bind(this),
            doUpdate: this.doUpdate.bind(this),
            /*
            
            <SettingItem id="" name={label} note={<code className="inline">{version} ({lastCommit})</code>}>
                {isUpdated 
                    ? <div className="bd-updates-updated"><Tick className="bd-icon" /></div> 
                    : <button className="bd-button bd-update-button">Update</button>
                }
            </SettingItem>
            
            
            */
            renderItems: updates => this.urls.map(update => {
                const hasUpdate = updates.find(e => e.name === update.name);
                return React.createElement(SettingItem, {
                    name: update.name,
                    note: React.createElement("code", {className: "inline"}, hasUpdate ? `An update is available. v${update.currentVersion} => v${hasUpdate.newVersion}` : "v" + update.currentVersion), 
                }, hasUpdate ? React.createElement("button", {
                    className: "bd-button bd-update-button",
                    onClick: () => {},
                }, "Update") : React.createElement("div", {
                    className: "bd-updates-updated"
                }, React.createElement(Tick, {className: "bd-icon"})));
            })
        });
    }
};