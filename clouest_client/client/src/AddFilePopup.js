import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import "./css/AddFilePopup.css";
import ContractsManager from './tools/ContractsManager';
import IpfsManager from './tools/IpfsManager';

class AddFilePopup extends Component {
  state = {
    file: null,
    web3: this.props.web3,
    currentFolder: this.props.currentFolder,
    path: this.props.path,
    loading: false,
    updateFileViwer: this.props.updateFileViwer,
    uploadingToIpfs: false,
    uploadingToBlockchain: false
  }

  humanFileSize = (size) => {
    var i = size === 0 ? 0 : Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  };

  async componentDidUpdate(prevProps) {
		if (this.props.currentFolder !== prevProps.currentFolder)
		{
			await this.setState({ currentFolder: this.props.currentFolder});
			this.render();
		}
    if(this.props.path !== prevProps.path)
    {
      await this.setState({ path: this.props.path });
			this.render();
    }
	}

  fileInputOnChangeHandler = (e) => {
    //console.log(e.target.files[0]);
    e.target.setAttribute("data-title", e.target.files[0].name + "\n(" + this.humanFileSize(e.target.files[0].size) + ")");
    this.setState({file: e.target.files[0]});
  }

  uploadFile = async (e) => {
    e.preventDefault();
    const { file, web3, currentFolder } = this.state;
    
    if (file == null) return; // avoid user clicking without loading file

    let uniqueId = null;
    this.setState({uploadingToIpfs: true});
    /* UPLOAD FILES TO IPFS NETWORK */
    const ipfsManager = new IpfsManager();
    ipfsManager.init( async () => {

      let walletAddress = await web3.eth.getAccounts();
      console.log("AddFilePopup" + walletAddress[0]);
      
      uniqueId = await ipfsManager.uploadFile(file, walletAddress[0]);
      this.setState({uploadingToIpfs: false, uploadingToBlockchain: true});
      if(uniqueId != null){
        /* UPLOAD DETAILS TO CHAIN */
        const contractsManager = new ContractsManager(web3);
        contractsManager.init( async () => {
        await contractsManager.addFile(uniqueId, file, currentFolder.id);
        this.setState({uploadingToBlockchain: false, open: false});
        this.state.updateFileViwer();
        });
      }
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

  renderUploadingToIpfs = () => {
    return (<div className="ui active inverted dimmer">
      <div className="ui text loader">Uploading file to the IPFS network...</div>
    </div>);
  }

  renderUploadingToBlockChain = () => {
    return (<div className="ui active inverted dimmer">
      <div className="ui text loader">Uploading file details to the Blockchain...</div>
    </div>);
  }

  render() {
    const {open, uploadingToIpfs, uploadingToBlockchain} = this.state;
    return (
      <Popup open={open} onClose={() => this.setState({open: undefined})} trigger={<button className="ui teal right labeled icon button"
        style={{ borderRadius: "50px" }} >
        <i className="add icon" ></i>
          File
          </button>} modal>
        <div className="modal">
          <h3 className="ui horizontal divider header">
            <i className="teal file icon"></i>
            Add File
          </h3>
          <div style={{textAlign: "center"}}>{this.renderPath()}</div>
          <form className="ui form">
            {uploadingToIpfs ? this.renderUploadingToIpfs() : ""}
            {uploadingToBlockchain ? this.renderUploadingToBlockChain() : ""}
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