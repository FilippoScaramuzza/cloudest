import React, { Component } from "react";
import 'reactjs-popup/dist/index.css';

//import FileDetailsManager from "./contracts/FileDetailsManager.json";
import getWeb3 from "./getWeb3";

import logo from './img/logo.svg';
import 'semantic-ui-css/semantic.min.css'

import "./css/App.css";
import AddFilePopup from "./AddFilePopup";

class App extends Component {

  state = {
    currentPage: "files",
    web3: null,
    accounts: null,
    contract: null
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      //const networkId = await web3.eth.net.getId();
      /*
      const deployedNetwork = Faucet.networks[networkId];
      const instance = new web3.eth.Contract(
        Faucet.abi,
        deployedNetwork && deployedNetwork.address,
      );
      */
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.

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

  render() {
    const { currentPage } = this.state;

    if (!this.state.web3) {
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
          <AddFilePopup />
          <br /><br /><br />
          <button className="ui teal right labeled icon button"
                  style={{ width: "60%" }}
                  onClick={() => this.changeCurrentPage("files")}>
                  <i className="folder icon"></i>
            Files and Folders
          </button>

                <br /><br />
                <button className="ui teal right labeled icon button"
                  style={{ width: "60%" }}
                  onClick={() => this.changeCurrentPage("recent")}>
                  <i className="clock outline icon"></i>
            Recent files
          </button>

                <br /><br />
                <button className="ui teal right labeled icon button"
                  style={{ width: "60%" }}
                  onClick={() => this.changeCurrentPage("preferred")}>
                  <i className="star icon"></i>
            Preferred files
          </button>


        </div>
              <div className="mainpage">
                <h1 className="ui horizontal divider header">
                  <i className="teal folder icon"></i>
                  {currentPage}
                </h1>
              </div>
            </div>
    );
  }
}

export default App;
