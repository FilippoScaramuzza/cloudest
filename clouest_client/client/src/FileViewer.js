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
		updateCurrentFolder: this.props.updateCurrentFolder
	}

	componentDidMount = async () => {
		this.retrieveFiles();
		this.state.updateCurrentFolder("Cartella dei merdoni");
	}

	componentDidUpdate(prevProps) {
		if (this.props.currentPage !== prevProps.currentPage) // Check if it's a new user
		{
			this.setState({ currentPage: this.props.currentPage });
			this.render();
		}
	}

	retrieveFiles = () => {
		const { web3 } = this.state;

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.getFilesDetails().then((res) => {
				res.forEach(fd => {
					fd["downloading"] = false;
					fd["favoriting"] = false; // "favoriting" is not a real word
					fd["deleting"] = false;
				});
				this.setState({ filesDetails: res });
			});
		});
	}

	getIconFromExtension = (fileType) => {
		switch (fileType) {
			case "application/pdf":
				return "teal file pdf outline icon";
			case "image/png":
				return "teal file image outline icon";
			case "image/jpg":
				return "teal file image outline icon";
			case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				return "teal file word outline icon";
			case "folder":
				return "teal folder outline icon"
			default:
				return "teal file outline icon";
		}
	}

	downloadFile = (file) => {
		let { filesDetails } = this.state;
		const ipfsManager = new IpfsManager();

		filesDetails.find(fd => fd.uniqueId === file.uniqueId).downloading = true;

		this.setState({ filesDetails });

		ipfsManager.init(async () => {
			await ipfsManager.retrieveFile(file);
			filesDetails.find(fd => fd.uniqueId === file.uniqueId).downloading = false;
			this.setState({ filesDetails });
		});
	}

	setFavorite = (file) => {
		const { web3, filesDetails } = this.state;

		filesDetails.find(fd => fd.uniqueId === file.uniqueId).favoriting = true;
		this.setState({ filesDetails });

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.setFavorite(file.uniqueId, file.name, !file.isFavorite);
			filesDetails.find(fd => fd.uniqueId === file.uniqueId).favoriting = false;
			this.setState({ filesDetails });

			this.retrieveFiles();
		});

	}

	deleteFile = (file) => {
		const { web3, filesDetails } = this.state;

		filesDetails.find(fd => fd.uniqueId === file.uniqueId).deleting = true;
		this.setState({ filesDetails });

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.deleteFile(file.uniqueId, file.name);
			filesDetails.find(fd => fd.uniqueId === file.uniqueId).deleting = false;
			this.setState({ filesDetails });

			this.retrieveFiles();
		});

	}

	renderDownloading = () => {
		return (
			<div className="ui active inverted dimmer">
				<div className="ui text loader">Downloading...</div>
			</div>);
	}

	renderFavoriting = () => {
		return (
			<div className="ui active inverted dimmer">
				<div className="ui text loader">Changing Favorite...</div>
			</div>);
	}

	renderDeleting = () => {
		return (
			<div className="ui active inverted dimmer">
				<div className="ui text loader">Deleting...</div>
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
			const { fileType, uniqueId, transactionDate, name, isFavorite, downloading, favoriting, deleting } = fd;
			return (
				<div className="ui teal card" key={index}>
					{downloading ? this.renderDownloading() : ""}
					{favoriting ? this.renderFavoriting() : ""}
					{deleting ? this.renderDeleting() : ""}
					<div className="content">
						<i className={this.getIconFromExtension(fileType)} style={{ fontSize: "30px" }}></i>
					</div>
					<div className="content">
						<span className="header" onClick={() => { this.downloadFile(fd) }} data-tooltip={name} data-position="top center" style={{ cursor: "pointer" }} >{name.replace(/(.{16})..+/, "$1...")}</span>
						<div className="meta">
							<span className="date">{uniqueId}</span>
						</div>
						<Dropdown text='Actions'>
							<Dropdown.Menu>
								<div className="item" onClick={() => { this.downloadFile(fd) }}>
        					<i className="download icon"></i>
        					Download
        				</div>
								<RenameFilePopup uniqueId={uniqueId} name={name} web3={this.state.web3} />
								<div className="item"onClick={() => { this.setFavorite(fd) }}>
        					<i className={isFavorite ? 'yellow star icon' : 'yellow outline star icon'}></i>
        					{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        				</div>
								<Dropdown.Divider />
								<div className="item" onClick={() => { this.deleteFile(fd) }}>
        					<i className="red trash icon"></i>
        					Delete
        				</div>
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