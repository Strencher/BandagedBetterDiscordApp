import {Logger, React, WebpackModules} from "modules";
import Updates from "../ui/updates";
import SettingsManager from "./settingsmanager";
// import Utilities from "./utilities";
import Notifications, {Types} from "../ui/notifications";

const UserSettings = WebpackModules.getByProps("updateAccount", "open");

let isFirstOpenUserSettings = true;

export default new class Updater {
    get defaultProps() {return ["name", "id", "renderItems", "handler", "interval", "doUpdate"];}

    constructor() {
        this.updateServices = [];
        this.lastDid = new Map();
        this.updates = [{name: "Core", newVersion: "1.0.1"}];
        this.updaterRef = React.createRef();
    }

    async updateFunction() {
        this.setState({fetching: true});

        await Promise.all(this.updateServices.map(service => {
            let cancelled = false;
            const lastDid = this.lastDid.get(service.id);

            if (!lastDid || lastDid.date < Date.now() - service.interval) {
                return new Promise(resolve => {
                    const timeout = setTimeout(() => {
                        cancelled = true;
                        Logger.warn("Updater", `Update handler at ${service.id} took longer than 5 minutes. Skipping.`);
                        resolve();
                    }, 300000);

                    this.checkForUpdates(service).then(updates => {
                        clearTimeout(timeout);
                        if (cancelled || !updates.length) return resolve();
                        
                        this.updates.push(...updates);
                        this.alertListeners(service.name);
                        resolve();
                    });
                    this.lastDid.set(service.id, Date.now());
                });
            }
        }));
        this.setState({fetching: false});
    }

    setState(state) {
        if (this.updaterRef && this.updaterRef.current) this.updaterRef.current.setState(state);
    }

    startInterval() {
        this.intervalId = setInterval(this.updateFunction.bind(this), 600000);
        this.updateFunction();
    }

    alertListeners(name) {
        Notifications.show({
            type: Types.INFO,
            text: `You got some new ${name} updates. Open updater to checkout.`,
            button: {
                label: "Open Updater",
                action: () => {
                    if (isFirstOpenUserSettings) {
                        isFirstOpenUserSettings = false;
                        UserSettings.open("account");
                        process.nextTick(() => UserSettings.open("updates"));
                    }
                    else {UserSettings.open("updates");}
                }
            }
        });
    }

    registerService(options) {
        if (!options || !this.defaultProps.every(prop => options[prop] !== undefined && options[prop] !== null)) return false;
        this.updateServices.push(options);
        this.updateFunction();
    }


    checkForUpdates(service) {
        try {
            return service.handler();
        } 
        catch (error) {
            return null;
        }
    }

    initialize() {
        SettingsManager.registerPanel("updates", "Updates", {
            element: () => React.createElement(Updates, {updater: this, ref: this.updaterRef})
        });
        this.updateFunction();
    }
};