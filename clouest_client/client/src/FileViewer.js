import React, { Component } from "react";
import ContractsManager from './tools/ContractsManager';
import { Dropdown } from 'semantic-ui-react';
import IpfsManager from './tools/IpfsManager';
import RenameFilePopup from './RenameFilePopup';

class FileViewer extends Component {
	state = {
		web3: this.props.web3,
		filesDetails: null,
		fileDownloading: null
	}

	componentDidMount = async () => {
		const { web3 } = this.state;

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.getFilesDetails().then((res) => {
				res.forEach(fd => {
					fd["downloading"] = false;
				});
				console.log(res);
				this.setState({ filesDetails: res });
			});
		});
	}

	getIconFromExtension = (fileExtension) => {
		switch(fileExtension) {
			case "application/pdf":
				return "teal file pdf outline icon";
			case "image/png":
				return "teal file image outline icon";
			case "image/jpg":
				return "teal file image outline icon"
			case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				return "teal file word outline icon"
			default:
				return "teal file outline icon";
		}
	}
	
	downloadFile = (file) => {
		let { filesDetails } = this.state;
		const ipfsManager = new IpfsManager();

		filesDetails.find(fd => fd.fileHash === file.fileHash).downloading = true;

		this.setState({filesDetails});

    ipfsManager.init( async () => {
    	await ipfsManager.retrieveFile(file);
			filesDetails.find(fd => fd.fileHash === file.fileHash).downloading = false;
			this.setState({filesDetails});
		  console.log(file.fileHash);
    });
	}

	renderDownloading = () => {
		return (
		<div className="ui active inverted dimmer">
			<div class="ui text loader">Downloading...</div>
		</div>);
	}

	renderFilesDetails = () => {
		const { filesDetails } = this.state;
		if (filesDetails == null) return null;
		return filesDetails.map((fd, index) => {
			const { fileExtension, fileHash, transactionDate, fileName, downloading } = fd;
			return (
					<div className="ui teal card" key={index}>
						{downloading ? this.renderDownloading() : ""}
						<div className="content">
							<i className={this.getIconFromExtension(fileExtension)} style={{fontSize: "30px"}}></i>
						</div>
						<div className="content">
							<span className="header" onClick={()=>{this.downloadFile(fd)}} data-tooltip={fileName} data-position="top center" style={{cursor: "pointer"}} >{fileName.replace(/(.{16})..+/, "$1...")}</span>
							<div className="meta">
								<span className="date">{transactionDate}</span>
							</div>
							<Dropdown text='Actions'>
								<Dropdown.Menu>
									<Dropdown.Item icon='icon download' text='Download' onClick={()=>{this.downloadFile(fd)}}/>
									<RenameFilePopup fileHash={fileHash} fileName={fileName} web3={this.state.web3}/>
									<Dropdown.Item icon='icon yellow outline star' text='Add to Favorite' />
									<Dropdown.Divider />
									<Dropdown.Item icon='icon red trash' text='Delete' />
								</Dropdown.Menu>
							</Dropdown>
						</div>
					</div>
			);
		});
	}

	render() {
		return (
			<div className="ui eight doubling cards">
				{this.renderFilesDetails()}
			</div>
		);
	}
}

export default FileViewer;