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
            <i class="add icon"></i>
            Add File
          </button>
          
          <br/><br/><br/>
          <button className="ui teal right labeled icon button" style={{width: "60%"}}>
            <i class="clock outline icon"></i>
            Recent files
          </button>

          <br/><br/>
          <button className="ui teal right labeled icon button" style={{width: "60%"}}>
            <i class="star icon"></i>
            Preferred files
          </button>
          

        </div>
        <div className="mainpage">
          <h1>My Files</h1>
        </div>
      </div>
    );
  }
}

export default App;
