import React, { Component } from "react";
import ContractsManager from './tools/ContractsManager';
import { Dropdown } from 'semantic-ui-react';
import IpfsManager from './tools/IpfsManager';
import RenameFilePopup from './RenameFilePopup';

class FileViewer extends Component {
	state = {
		web3: this.props.web3,
		currentPage: this.props.currentPage,
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
					fd["favoriting"] = false; // "favoriting" is not a real word
				});
				this.setState({ filesDetails: res });
			});
		});
	}

	componentDidUpdate(prevProps) {
		if(this.props.currentPage !== prevProps.currentPage) // Check if it's a new user
		{
			this.setState({currentPage: this.props.currentPage});
		  this.render();
		}
	  } 

	getIconFromExtension = (fileExtension) => {
		switch (fileExtension) {
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

		this.setState({ filesDetails });

		ipfsManager.init(async () => {
			await ipfsManager.retrieveFile(file);
			filesDetails.find(fd => fd.fileHash === file.fileHash).downloading = false;
			this.setState({ filesDetails });
		});
	}

	setFavorite = (file) => {
		const { web3, filesDetails } = this.state;

		filesDetails.find(fd => fd.fileHash === file.fileHash).favoriting = true;
		this.setState({ filesDetails });

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.setFavorite(file.fileHash, file.fileName, !file.isFavorite);
			filesDetails.find(fd => fd.fileHash === file.fileHash).favoriting = false;
			this.setState({ filesDetails });

			await contractsManager.getFilesDetails().then((res) => {
				res.forEach(fd => {
					fd["downloading"] = false;
					fd["favoriting"] = false; // "favoriting" is not a real word
				});
				this.setState({ filesDetails: res });
			});
		});
		
	}

	renderDownloading = () => {
		return (
			<div className="ui active inverted dimmer">
				<div class="ui text loader">Downloading...</div>
			</div>);
	}

	renderFavoriting = () => {
		return (
			<div className="ui active inverted dimmer">
				<div class="ui text loader">Changing Favorite...</div>
			</div>);
	}

	renderFilesDetails = () => {
		const { filesDetails, currentPage } = this.state;
		if (filesDetails == null) return null;
		let filesDetailsFiltered = null;
		switch (currentPage) {
			case "favorites":
				filesDetailsFiltered = filesDetails.filter(fd => fd.isFavorite === true);
				break;
			default:
				filesDetailsFiltered = filesDetails;
				break;
		}

		return filesDetailsFiltered.map((fd, index) => {
			const { fileExtension, fileHash, transactionDate, fileName, isFavorite, downloading, favoriting } = fd;
			return (
				<div className="ui teal card" key={index}>
					{downloading ? this.renderDownloading() : ""}
					{favoriting ? this.renderFavoriting() : ""}
					<div className="content">
						<i className={this.getIconFromExtension(fileExtension)} style={{ fontSize: "30px" }}></i>
					</div>
					<div className="content">
						<span className="header" onClick={() => { this.downloadFile(fd) }} data-tooltip={fileName} data-position="top center" style={{ cursor: "pointer" }} >{fileName.replace(/(.{16})..+/, "$1...")}</span>
						<div className="meta">
							<span className="date">{transactionDate}</span>
						</div>
						<Dropdown text='Actions'>
							<Dropdown.Menu>
								<Dropdown.Item icon='icon download' text='Download' onClick={() => { this.downloadFile(fd) }} />
								<RenameFilePopup fileHash={fileHash} fileName={fileName} web3={this.state.web3} />
								<Dropdown.Item icon={isFavorite ? 'icon yellow star' : 'icon yellow outline star'} text={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} onClick={() => { this.setFavorite(fd) }} />
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