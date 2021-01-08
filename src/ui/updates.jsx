import {React, Utilities} from "modules";
import Tick from "./icons/tick";
import SettingItem from "./settings/components/item";
import Group from "./settings/group";
import Title from "./settings/title";

export default class Updates extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fetching: false,
            updating: false,
            updates: props.updater.updates
        };
    }
    
    startUpdating() {
        if (!this.state.fetching) return;

        this.setState({updating: true});
        setTimeout(() => {
            this.setState({updating: false, updates: []});
        }, 5000);
    }

    renderVersionCard(label, version, lastCommit, isUpdated) {
        return <SettingItem id="" name={label} note={<code className="inline">{version} ({lastCommit})</code>}>
            {isUpdated ? <div className="bd-updates-updated"><Tick className="bd-icon" /></div> : <button className="bd-button bd-update-button">Update</button>}
        </SettingItem>;
    }

    renderTable() {
        let className, text;
        if (this.state.fetching) {
            className = "fetching spin";
            text = "Searching for Updates...";
        } 
        else if (this.state.updating) {
            className = "updating spin";
            text = "Installing Updates...";
        }
        else if (this.state.updates.length) {
            className = "outdated";
            text = "Some updates appeared! Click \"Update All\" to update all.";
        }
        else {
            className = "updated";
            text = "No Updates available.";
        }

        return <div className="bd-updater-fetch" grow={1} shrink={1}>
            <div className="bd-updater-header">
                <button onClick={this.startUpdating.bind(this)} className={Utilities.joinClassNames("bd-button", "bd-updateAll", (!this.state.updates.length || this.state.updating) && "bd-button-disabled")}>Update All</button>
            </div>
            <svg aria-hidden="false" className={"bd-updates-arrow " + className} width="80" height="80" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.485 2 2 6.485 2 12H5.33333C5.33333 8.32333 8.32333 5.33333 12 5.33333C15.6767 5.33333 18.6667 8.32333 18.6667 12C18.6667 15.6767 15.6767 18.6667 12 18.6667C10.2033 18.6667 8.55833 17.9333 7.315 16.6867L10.3333 13.6667H2V22L4.935 19.065C6.79833 20.94 9.30167 22 12 22C17.515 22 22 17.515 22 12C22 6.48667 17.515 2 12 2Z"></path></svg>
            <div className="bd-text">{text}</div>
        </div>;
    }

    checkForUpdates() {
        // this.props.updater.checkForUpdates().then(updates => {
        //     this.setState({fetching: false, updates});
        // });
        // this.setState({fetching: true});
    }

    componentDidMount() {
        this.checkForUpdates();
    }

    render() {
        return <>
            <Title text="Updates" button={{title: "Check For Updates", onClick: () => this.checkForUpdates()}}>Updates</Title>
            {this.renderTable()}
            {this.props.updater.updateServices.map(e => <Group name={e.name} collapsible={true}>{e.renderItems(this.state.updates)}</Group>)}
        </>;
    }
}