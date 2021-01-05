import {React, WebpackModules} from "modules";
import Updates from "../ui/updates";
import SettingsManager from "./settingsmanager";
import Utilities from "./utilities";
import Notifications, {Types} from "../ui/notifications";

const UserSettings = WebpackModules.getByProps("updateAccount", "open");

export default new class Updater {
    get updateURL() {return Utilities.repoUrl();} // Zere needs to deal with that.

    checkForUpdates() {
        return new Promise(resolve => {
            setTimeout(() => resolve([{type: "injector"}]), 5000); // Show a dummy update for test purposes
        });  
    }

    initialize() {
        SettingsManager.registerPanel("updates", "Updates", {
            element: () => React.createElement(Updates, {updater: this})
        });
        this.checkForUpdates().then(updates => {
            if (!updates.length) return;
            const id = Notifications.show({
                type: Types.WARN,
                text: "Some updates are appeared. Consider updating now.",
                button: {
                    label: "Open Settings",
                    action: () => {
                        UserSettings.open("updates");
                        Notifications.hide(id);
                    }
                }
            });
        });
    }
};