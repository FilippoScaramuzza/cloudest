import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import "./css/AddFilePopup.css";
import ContractsManager from './tools/ContractsManager';

class RenameFilePopup extends Component {
  state = {
    fileName: this.props["fileName"],
    newName: this.props["fileName"],
    fileHash: this.props["fileHash"],
    web3: this.props["web3"],
    loading: false
  }

  fileInputOnChangeHandler = (e) => {
    this.setState({newName: e.target.value});
  }

  renameFile = async (e) => {
    e.preventDefault();
    const { fileHash, fileName, newName, web3 } = this.state;

    this.setState({loading: true});

    const contractsManager = new ContractsManager(web3);
    contractsManager.init(async () => {
      await contractsManager.renameFileName(fileHash, fileName, newName);
      this.setState({loading: false});
      window.location.reload();
    });
  }

  render() {
    return (
      <Popup trigger={<div class="item">
        <i className="i cursor icon"></i>
        Rename
        </div>} modal>
        <div className="modal">
          <h3 className="ui horizontal divider header">
            <i className="teal file icon"></i>
            Rename File
          </h3>
          <form className={this.state.loading ? "ui loading form" : "ui form"}>
            <div className="ui action input">
              <input type="text" placeholder={this.state.newName} onChange={this.fileInputOnChangeHandler} />
              <button className="ui teal right labeled icon button" onClick={this.renameFile}>
                <i class="i cursor icon"></i>
                Rename
              </button>
            </div>
          </form>
        </div>
      </Popup>
    );
  }
}

export default RenameFilePopup;