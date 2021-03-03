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
		updateCurrentFolder: this.props.updateCurrentFolder,
		currentFolder: {
			id: "/",
			name: "root",
			parentFolderId: "/"
		},
		path: [{
			id: "/",
			name: "root",
			parentFolderId: "/"
		}]
	}

	componentDidMount = async () => {
		this.retrieveFiles();
	}

	componentDidUpdate(prevProps) {
		if (this.props.currentPage !== prevProps.currentPage) {
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

				res.forEach(function(fd,i){
					if(fd.fileType === "folder"){
					  res.splice(i, 1);
					  res.unshift(fd);
					}
				});

				console.log(res);

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
				return "inverted folder icon"
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

	deleteFolder = (folder) => {
		const { web3, filesDetails } = this.state;
	
		filesDetails.find(fd => fd.uniqueId === folder.uniqueId).deleting = true;
		this.setState({ filesDetails });

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.deleteFolder(folder.uniqueId);
			filesDetails.find(fd => fd.uniqueId === folder.uniqueId).deleting = false;
			this.setState({ filesDetails });

			this.retrieveFiles();
		});
	}

	changeCurrentFolder = async (uniqueId, name, parentFolderId) => {
		let { updateCurrentFolder,  path} = this.state;
		await this.setState({ currentFolder: { id: uniqueId, name: name, parentFolderId: parentFolderId} })
		path.push(this.state.currentFolder)
		await this.setState({ path })
		updateCurrentFolder(this.state.currentFolder, path);
	}

	goToParentFolder = async () => {
		const { updateCurrentFolder, filesDetails, currentFolder } = this.state;
		let {path} = this.state;
		path.pop()
		let parentFolder = currentFolder.parentFolderId==="/" ?  { uniqueId: "/", name: "root", parentFolderId: "/"} : filesDetails.filter(fd => fd.uniqueId === currentFolder.parentFolderId)[0];
		await this.setState({ currentFolder: { id: parentFolder.uniqueId, name: parentFolder.name, parentFolderId: parentFolder.parentFolderId}, path })
		updateCurrentFolder(this.state.currentFolder, path);
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

	renderFile = (fd, index) => {
		const { fileType, uniqueId, name, isFavorite, downloading, favoriting, deleting } = fd;
		return (
			<div className="ui teal card" key={index}>
					{downloading ? this.renderDownloading() : ""}
					{favoriting ? this.renderFavoriting() : ""}
					{deleting ? this.renderDeleting() : ""}
					<div className="content">
						<i className={this.getIconFromExtension(fileType)} style={{ fontSize: "30px" }}></i>
						<br /><br />
						<span className="header"
							onClick={() => this.downloadFile(fd)}
							data-tooltip={name}
							data-position="top center"
							style={{ cursor: "pointer" }}>
							{name.replace(/(.{16})..+/, "$1...")}
						</span>
						<Dropdown text='Actions'>
							<Dropdown.Menu>
								<div className="item" onClick={() => { this.downloadFile(fd) }}>
									<i className="download icon"></i>
        							Download
        						</div>
								<RenameFilePopup uniqueId={uniqueId} name={name} web3={this.state.web3} />
								<div className="item" onClick={() => { this.setFavorite(fd) }}>
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
	}

	renderFolder = (fd, index) => {
		const { fileType, uniqueId, name, parentFolderId, deleting } = fd;
		return (
			<div className="ui teal card" key={index} onClick={() => { this.changeCurrentFolder(uniqueId, name, parentFolderId) }}>
					{deleting ? this.renderDeleting() : ""}
					<div className="content" style={{ backgroundColor: "#00ACA3", color: "white" }}>
						<i className={this.getIconFromExtension(fileType)} style={{ fontSize: "30px" }}></i>
						<br /><br />
						<span className="header"
							data-tooltip={name}
							data-position="top center"
							style={{ cursor: "pointer", color: "white" }}>
							{name.replace(/(.{16})..+/, "$1...")}
						</span>
						<Dropdown text='Actions'>
							<Dropdown.Menu>
								<RenameFilePopup uniqueId={uniqueId} name={name} web3={this.state.web3} />
								<Dropdown.Divider />
								<div className="item" onClick={() => { this.deleteFolder(fd) }}>
									<i className="red trash icon"></i>
        							Delete
        						</div>
							</Dropdown.Menu>
						</Dropdown>
					</div>
				</div>
		);
	}

	renderFilesDetails = () => {
		const { filesDetails, currentPage, currentFolder } = this.state;
		if (filesDetails == null) return null;
		let filesDetailsFiltered = null;
		
		switch (currentPage) {
			case "favorites":
				filesDetailsFiltered = filesDetails.filter(fd => fd.isFavorite === true && fd.fileType !== "folder");
				break;
			case "recent":

				let date = new Date();
				let dd = String(date.getDate()).padStart(2, '0');
				let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
				let yyyy = date.getFullYear();
				date = mm + '/' + dd + '/' + yyyy;

				filesDetailsFiltered = filesDetails.filter(fd => fd.transactionDate === date && fd.fileType !== "folder");
				break;
			default:
				filesDetailsFiltered = filesDetails.filter(fd => fd.parentFolderId === currentFolder.id);
				break;
		}

		return filesDetailsFiltered.map((fd, index) => {
			if(fd.fileType !== "folder") {
				return this.renderFile(fd, index);
			}
			else {
				return this.renderFolder(fd, index);
			}
		});
	}

	renderPath = () => {
		const { path } = this.state;
		return path.map((folder, index) => {
			return (<><div className="ui icon label" key={index}>
						<i className="folder icon"/>
						{folder.name}
		  			</div>{index!==path.length-1 ? ">" : ""}</>);
		});
	}

	render() {
		const { currentFolder } = this.state;
		if(currentFolder.id === "/") return (
			<>
			<span> 
				{this.renderPath()}
			</span>
			<br/><br/>
			<div className="ui eight doubling cards">
				{this.renderFilesDetails()}
			</div></>);
		else return (
			<>
			<span>
				{this.renderPath()}
			</span>
			<br/><br/>
			<div className="ui eight doubling cards">
				<div className="ui teal card" onClick={() => { this.goToParentFolder() }}>
					<div className="content" style={{ backgroundColor: "#00ACA3", color: "white" }}>
						<i className="inverted folder icon" style={{ fontSize: "30px" }}></i>
						<br /><br />
						<span className="header"
							data-tooltip={"Previus folder"}
							data-position="top center"
							style={{ cursor: "pointer"}} >
							<i className="inverted arrow left icon" style={{ fontSize: "15px" }}></i>
						</span>
						<br/>
					</div>
				</div>
				{this.renderFilesDetails()}
			</div>
			</>
		);
	}
}

export default FileViewer;