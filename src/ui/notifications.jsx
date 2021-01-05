import {DiscordModules, Patcher, React, ReactComponents, Utilities, WebpackModules} from "modules";

const AppClases = WebpackModules.getByProps("container", "downloadProgressCircle", "guilds");

export const Types = {
    INFO: "bd-notification-info",
    WARN: "bd-notification-warn",
    SUCCESS: "bd-notification-success",
    ERROR: "bd-notification-error"
};

const joinClassNames = (...classNames) => classNames.filter(e => e).join(" ");

export class Notification extends React.Component {
    render() {
        return <div className={joinClassNames("bd-notification", this.props.options.type)}>
            <div className="bd-notification-closeButton" onClick={this.handleClose.bind(this)}></div>
            {this.props.options.text}
            {this.props.options.button && <div className="bd-notification-button" onClick={this.handleButtonClick.bind(this)}>{this.props.options.button.label}</div>}
        </div>;
    }

    handleButtonClick(e) {
        if (typeof(this.props.options.button.action) !== "function") return;
        return this.props.options.button.action(e);
    }

    handleClose() {
        this.props.onClose();
    }
}

export class NotificationsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.notifications = [];
    }

    addNotification(id, options) {
        this.notifications.push({
            id: id,
            element: <Notification options={options} onClose={() => this.removeNotification(id)} />
        });
        this.forceUpdate();
    }

    removeNotification(id) {
        const index = this.notifications.findIndex(e => e.id === id);
        if (index == -1) return false;
        this.notifications.splice(index, 1);
        this.forceUpdate();
        return true;
    }

    render() {
        return <div className="bd-notifications">
            {this.notifications.map(e => e.element)}
        </div>;
    }
}

export default class Notifications {
    static async initialize() {
        this.ref = React.createRef();

        const AppView = await ReactComponents.get("AppView", m => m && m.prototype && m.prototype.renderGuestGuard);
        Patcher.after("Bd-Notifications", AppView.prototype, "render", (_, __, returnValue) => {
            const tree = Utilities.findInReactTree(returnValue, m => m && m.className && m.className.indexOf("base") > -1);
            if (!tree || !Array.isArray(tree.children));
            tree.children.splice(1, 0, <NotificationsContainer ref={this.ref}/>);
        });
        this.forceUpdate();
    }

    static show(options = {}) {
        if (!this.ref || !this.ref.current) return false;
        if (!options.text) options.text = "";
        if (!options.onClose) options.onClose = () => {};

        const id = DiscordModules.KeyGenerator(); // eslint-disable-line new-cap

        this.ref.current.addNotification(id, options);
    }

    static hide(id) {
        if (!this.ref || !this.ref.current) return false;
        return this.ref.current.removeNotification(id);
    }

    static forceUpdate() {
        const element = document.getElementsByClassName(AppClases.container)[0];
        if (!element) return;
        const instance = Utilities.getOwnerInstance(element);
        if (!instance || !instance.forceUpdate) return;
        instance.forceUpdate();
    }
}