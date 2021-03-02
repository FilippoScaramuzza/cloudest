import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import "./css/AddFilePopup.css";
import ContractsManager from './tools/ContractsManager';
import IpfsManager from './tools/IpfsManager';

class AddFilePopup extends Component {
  state = {
    file: null,
    web3: this.props["web3"],
    loading: false
  }

  humanFileSize = (size) => {
    var i = size === 0 ? 0 : Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  };

  fileInputOnChangeHandler = (e) => {
    //console.log(e.target.files[0]);
    e.target.setAttribute("data-title", e.target.files[0].name + "\n(" + this.humanFileSize(e.target.files[0].size) + ")");
    this.setState({file: e.target.files[0]})
  }

  uploadFile = async (e) => {
    e.preventDefault();
    const { file, web3 } = this.state;
    
    if (file == null) return; // avoid user clicking without loading file

    let uniqueId = null;
    this.setState({loading: true});
    /* UPLOAD FILES TO IPFS NETWORK */
    const ipfsManager = new IpfsManager();
    ipfsManager.init( async () => {
      uniqueId = await ipfsManager.uploadFile(file);
      console.log(uniqueId);
      if(uniqueId != null){
        /* UPLOAD DETAILS TO CHAIN */
        const contractsManager = new ContractsManager(web3);
        contractsManager.init( async () => {
        await contractsManager.addFile(uniqueId, file);
        this.setState({loading: false});
        window.location.reload();
        });
      }
    });

  }

  render() {
    return (
      <Popup trigger={<button className="ui teal right labeled icon button"
        style={{ borderRadius: "50px" }} >
        <i className="add icon" ></i>
          File
          </button>} modal>
        <div className="modal">
          <h3 className="ui horizontal divider header">
            <i className="teal file icon"></i>
            Add File
          </h3>
          <form className={this.state.loading ? "ui loading form" : "ui form"}>
            <div className="form-group inputDnD">
              <input type="file" className="form-control-file text-danger font-weight-bold" id="inputFile" data-title="Click here to select a file or Drag and Drop it."
              onChange={this.fileInputOnChangeHandler} />
            </div>
            <br/><br />
            <button className="ui teal right labeled icon button" style={{ margin: "auto", display: "block" }} onClick={this.uploadFile}>
              <i className="upload icon"></i>
              Upload File
            </button>
          </form>
        </div>
      </Popup>
    );
  }
}

export default AddFilePopup;