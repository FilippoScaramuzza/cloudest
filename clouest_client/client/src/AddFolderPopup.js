import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import "./css/AddFilePopup.css";
import ContractsManager from './tools/ContractsManager';

class AddFolderPopup extends Component {
  state = {
    file: null,
    web3: this.props["web3"],
    currentFolder: this.props["currentFolder"],
    path: this.props["path"],
    name: "",
    loading: false
  }

  async componentDidUpdate(prevProps) {
		if (this.props.currentFolder !== prevProps.currentFolder) // Check if it's a new user
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
      this.setState({loading: false});
      window.location.reload();
    });
  }

  renderPath = () => {
		const { path } = this.state;
		return path.map((folder, index) => {
			return (<><div class="ui icon label" key={index} style={{marginBottom: "5px"}}>
						<i className="folder icon" />
						{folder.name}
		  			</div>{index!==path.length-1 ? ">" : ""}</>);
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