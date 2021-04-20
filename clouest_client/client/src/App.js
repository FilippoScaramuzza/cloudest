import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
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
    currentFolder: {
      id: "/",
      name: "root",
      parentFolderId: "/"
    },
    path: [{
      id: "/",
      name: "root",
      parentFolderId: "/"
    }],
    fileViewer: React.createRef(),
    searchValue: null
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

  searchValueOnChangeHandler = (e) => {
    this.setState({ searchValue: e.target.value });
  }

  renderPageTitle = () => {
    const { currentPage, searchValue } = this.state;
    switch (currentPage) {
      case "files":
        return <span>Files and Folders</span>;
      case "recent":
        return <span>Recent Files</span>;
      case "favorites":
        return <span>Favorites Files</span>;
      case "trash":
        return <span>Trash Bin</span>;
      case "search":
        return <span>Search Results of "{searchValue}"</span>;
      default:
        return <span>Come hai fatto?</span>;
    }
  }

  render() {
    const { currentPage, currentFolder, path, web3, searchValue } = this.state;

    if (!web3) {
      return (
        <div className="App">
          <MetaTags>
            <title>Cloudest</title>
            <meta id="meta-description" name="description" content="The Cloud We Deserve. A decentralized cloud storage based on IPFS and Ethereum." />
            <meta id="og-title" property="og:title" content="Cloudest" />
          </MetaTags>
          <div className="ui info message" style={{ margin: "40px auto" }}>
            <div className="header" style={{ textAlign: "center" }}>
              Connecting to the Blockchain via Metamask...<br />
              If you get an error:
          </div>
            <ul className="list">
              <li>Check if you have installed MetaMask (if not you can download it at <a href="https://metamask.io" target="_blank">metamask.io</a>)</li>
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

          <br /><br />
          <div className="ui icon input" style={{ width: "70%" }} onClick={() => this.changeCurrentPage("search")}>
            <input type="text" placeholder="Search..." onChange={this.searchValueOnChangeHandler} />
            <i className="teal inverted circular search link icon" ></i>
          </div>

          <br /><br /><br /><br />
          <button className="ui teal right labeled icon button"
            style={{ width: "50%", marginBottom: "20px" }}
            onClick={() => this.changeCurrentPage("trash")}>
            <i className="trash alternate outline icon"></i>
            Trash Bin
          </button>

        </div>

        <div className="mainpage">
          <h1 className="ui horizontal divider header">
            {this.renderPageTitle()}
          </h1>
          <FileViewer web3={web3} currentPage={currentPage} searchValue={searchValue} updateCurrentFolder={this.updateCurrentFolder} ref={this.state.fileViewer} />
        </div>
      </div>

    );
  }
}

export default App;
