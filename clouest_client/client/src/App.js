import React, { Component } from "react";

import logo from './img/logo.svg';
import 'semantic-ui-css/semantic.min.css'

import "./App.css";

class App extends Component {

  render() {
    /*if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }*/
    return (
      <div className="App">
        <div className="sidebar">
          <img className="main-logo-img" alt="Cloudest" src={logo} />
          
          <br/><br />
          <button className="ui teal right labeled icon button" style={{borderRadius: "50px"}}>
            <i className="add icon"></i>
            Add File
          </button>
          
          <br/><br/><br/>
          <button className="ui teal right labeled icon button" style={{width: "60%"}}>
            <i className="folder icon"></i>
            Files and Folders
          </button>

          <br/><br/>
          <button className="ui teal right labeled icon button" style={{width: "60%"}}>
            <i className="clock outline icon"></i>
            Recent files
          </button>

          <br/><br/>
          <button className="ui teal right labeled icon button" style={{width: "60%"}}>
            <i className="star icon"></i>
            Preferred files
          </button>
          

        </div>
        <div className="mainpage">
          <h1 className="ui horizontal divider header">
            <i className="teal folder icon"></i>
            Files and Folders
          </h1>
        </div>
      </div>
    );
  }
}

export default App;
