import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import "./css/AddFilePopup.css";
import ContractsManager from './tools/ContractsManager';

class AddFolderPopup extends Component {
  state = {
    file: null,
    web3: this.props.web3,
    currentFolder: this.props.currentFolder,
    path: this.props.path,
    updateFileViwer: this.props.updateFileViwer,
    name: "",
    loading: false
  }

  async componentDidUpdate(prevProps) {
		if (this.props.currentFolder !== prevProps.currentFolder)
		{
			this.setState({ currentFolder: this.props.currentFolder });
			this.render();
		}
    if(this.props.path !== prevProps.path)
    {
      await this.setState({ path: this.props.path });
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
      this.setState({loading: false, open: false});
      this.state.updateFileViwer();
    });
  }

  renderPath = () => {
		const { path, currentFolder } = this.state;
		return path.map((folder, index) => {
			return (<><div class="ui icon label" key={index} style={{marginBottom: "5px"}}>
						<i className={currentFolder.id === folder.id ? "folder open icon" : "folder icon"} />
						{folder.name}
		  			</div>{index!==path.length-1 ? ">" : ""}</>);
		});
	}

  render() {
    return (
      <Popup open={this.state.open} onClose={() => this.setState({open: undefined})} trigger={<button className="ui teal right labeled icon button"
      style={{ borderRadius: "50px" }} >
      <i className="add icon" ></i>
        Folder
        </button>} modal>
        <div className="modal">
          <h3 className="ui horizontal divider header">
            <i className="teal folder icon"></i>
            Add Folder
          </h3>
          <div style={{textAlign: "center"}}>{this.renderPath()}</div>
          <br/>
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