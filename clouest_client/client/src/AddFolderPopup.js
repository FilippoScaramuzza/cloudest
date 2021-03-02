import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import "./css/AddFilePopup.css";
import ContractsManager from './tools/ContractsManager';

class AddFolderPopup extends Component {
  state = {
    file: null,
    web3: this.props["web3"],
    currentFolder: this.props["currentFolder"],
    name: "",
    loading: false
  }

  componentDidUpdate(prevProps) {
		if (this.props.currentFolder !== prevProps.currentFolder) // Check if it's a new user
		{
			this.setState({ currentFolder: this.props.currentFolder });
			this.render();
		}
	}

  fileInputOnChangeHandler = (e) => {
    this.setState({name: e.target.value});
  }

  createFolder = async (e) => {
    e.preventDefault();
    const { name, web3, currentFolder } = this.state;

    this.setState({loading: true});

    const contractsManager = new ContractsManager(web3);
    contractsManager.init(async () => {
      await contractsManager.createFolder(name, currentFolder.id);
      this.setState({loading: false});
      window.location.reload();
    });
  }

  render() {
    return (
      <Popup trigger={<button className="ui teal right labeled icon button"
      style={{ borderRadius: "50px" }} >
      <i className="add icon" ></i>
        Folder
        </button>} modal>
        <div className="modal">
          <h3 className="ui horizontal divider header">
            <i className="teal folder icon"></i>
            Add Folder to {this.state.currentFolder.name}
          </h3>
          <form className={this.state.loading ? "ui loading form" : "ui form"}>
            <div className="ui action input">
              <input type="text" value={this.state.newName} onChange={this.fileInputOnChangeHandler} />
              <button className="ui teal right labeled icon button" onClick={this.createFolder}>
                <i className="folder icon"></i>
                Add Folder
              </button>
            </div>
          </form>
        </div>
      </Popup>
    );
  }
}

export default AddFolderPopup;