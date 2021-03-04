import React, { Component } from "react";

//import FileDetailsManager from "./contracts/FileDetailsManager.json";
import getWeb3 from "./getWeb3";
import AddFilePopup from "./AddFilePopup";
import AddFolderPopup from "./AddFolderPopup";
import FileViewer from "./FileViewer";

import logo from './img/logo.svg';
import 'reactjs-popup/dist/index.css';
import 'semantic-ui-css/semantic.min.css'
import "./css/App.css";

class App extends Component {

  state = {
    currentPage: "files",
    web3: null,
    accounts: null,
    contract: null,
    currentFolder: { id: "/", name: "root", parentFolderId: "/" },
    path: [{
      id: "/",
      name: "root",
      parentFolderId: "/"
    }],
    fileViewer: React.createRef()
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      //this.setState({ web3, accounts, contract: instance });
      this.setState({ web3, accounts });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  changeCurrentPage = (page) => {
    let currentPage = page;
    this.setState({ currentPage });
  }

  updateCurrentFolder = (currentFolder, path) => {
    this.setState({ currentFolder });
    this.setState({ path });
  }

  updateFileViwer = () => {
    this.state.fileViewer.current.retrieveFiles();
  }

  renderPageTitle = () => {
    const { currentPage } = this.state;
    switch (currentPage) {
      case "files":
        return <span>Files and Folders</span>;
      case "recent":
        return <span>Recent Files</span>;
      case "favorites":
        return <span>Favorites Files</span>;
      case "trash":
        return <span>Trash Bin</span>;
      default:
        return <span>Come hai fatto?</span>;
    }
  }

  render() {
    const { currentPage, currentFolder, path, web3 } = this.state;

    if (!web3) {
      return (
        <div className="App">
          <div className="ui info message" style={{ margin: "40px auto" }}>
            <div className="header" style={{ textAlign: "center" }}>
              Connecting to the Cloudest Chain...<br />
              If it is taking too long you can:
          </div>
            <ul className="list">
              <li>Check if you have installed MetaMask with the connection to the Cloudest Chain</li>
              <li>Reload the page</li>
            </ul>
          </div>
        </div>
      );
    }
    return (
      <div className="App">
        <div className="sidebar">
          <img className="main-logo-img" alt="Cloudest" src={logo} />

          <br /><br />
          <AddFilePopup web3={web3} currentFolder={currentFolder} path={path} updateFileViwer={this.updateFileViwer} />
          <AddFolderPopup web3={web3} currentFolder={currentFolder} path={path} updateFileViwer={this.updateFileViwer} />
          <br /><br /><br />
          <button className="ui teal right labeled icon button"
            style={{ width: "70%" }}
            onClick={() => this.changeCurrentPage("files")}>
            <i className="folder outline icon"></i>
            Files and Folders
          </button>

          <br /><br />
          <button className="ui teal right labeled icon button"
            style={{ width: "70%" }}
            onClick={() => this.changeCurrentPage("recent")}>
            <i className="clock outline icon"></i>
            Recent Files
          </button>

          <br /><br />
          <button className="ui teal right labeled icon button"
            style={{ width: "70%" }}
            onClick={() => this.changeCurrentPage("favorites")}>
            <i className="star outline icon"></i>
            Favorites Files
          </button>

        </div>
        <div className="mainpage">
          <h1 className="ui horizontal divider header">
            {this.renderPageTitle()}
          </h1>
          <FileViewer web3={web3} currentPage={currentPage} updateCurrentFolder={this.updateCurrentFolder} ref={this.state.fileViewer} />
        </div>
      </div>
    );
  }
}

export default App;
