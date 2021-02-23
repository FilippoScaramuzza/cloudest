import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import ContractsManager from './tools/ContractsManager';
import "./css/AddFilePopup.css";

class AddFilePopup extends Component {
  state = {
    file: null,
    web3: this.props["web3"]
  }

  fileInputOnChangeHandler = (e) => {
    //console.log(e.target.files[0]);
    e.target.setAttribute("data-title", e.target.files[0].name + "\n(" + e.target.files[0].size + 0.000001 + " MB)");
    this.setState({file: e.target.files[0]})
  }

  uploadFile = async (e) => {
    e.preventDefault();
    const { file, web3 } = this.state;
    const pippo = new ContractsManager(web3);
    pippo.loadDetailsToChain("hash1234", file);
  }

  render() {
    return (
      <Popup trigger={<button className="ui teal right labeled icon button"
        style={{ borderRadius: "50px" }} >
        <i className="add icon" ></i>
                Add File
              </button>} modal>
        <div className="modal">
          <h3 className="ui horizontal divider header">
            <i className="teal file icon"></i>
            Add File
          </h3>
          <form className="ui form">
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