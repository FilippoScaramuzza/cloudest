import React, { Component } from "react";
import ContractsManager from './tools/ContractsManager';
import { Dropdown } from 'semantic-ui-react';
import IpfsManager from './tools/IpfsManager';
import RenameFilePopup from './RenameFilePopup';

import filetypes from './resources/filetypes.json';

class FileViewer extends Component {
	state = {
		web3: this.props.web3,
		currentPage: this.props.currentPage,
		filesDetails: null,
		updateCurrentFolder: this.props.updateCurrentFolder,
		searchValue: this.props.searchValue,
		currentFolder: {
			id: "/",
			name: "root",
			parentFolderId: "/"
		},
		path: [{
			id: "/",
			name: "root",
			parentFolderId: "/"
		}],
		currentFolderTrash: {
			id: "/",
			name: "trash",
			parentFolderId: "/"
		},
		pathTrash: [{
			id: "/",
			name: "trash",
			parentFolderId: "/"
		}],
		filterFiles: [],
		currentFileFilter: ""
	}

	componentDidMount = async () => {
		this.retrieveFiles();
	}

	componentDidUpdate(prevProps) {
		if (this.props.currentPage !== prevProps.currentPage) {
			this.setState({
				currentPage: this.props.currentPage,
				currentFolder: { id: "/", name: "root", parentFolderId: "/" },
				path: [{ id: "/", name: "root", parentFolderId: "/" }],
				currentFolderTrash: { id: "/", name: "trash", parentFolderId: "/" },
				pathTrash: [{ id: "/", name: "trash", parentFolderId: "/" }]
			});
			this.render();
		}
		if (this.props.searchValue !== prevProps.searchValue) {
			this.setState({ searchValue: this.props.searchValue.toUpperCase() });
			this.render();
		}
	}

	retrieveFiles = () => {
		const { web3 } = this.state;
		let { filterFiles } = this.state;
		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.getFilesDetails().then((res) => {
				res.forEach(fd => {
					fd["downloading"] = false;
					fd["favoriting"] = false; // "favoriting" is not a real word
					fd["deleting"] = false;
					fd["restoring"] = false;
				});

				filterFiles = [];

				res.forEach(function (fd, i) {
					if (fd.fileType === "folder") {
						res.splice(i, 1);
						res.unshift(fd);
					}
					else {
						if (!filterFiles.includes(fd.fileType)) {
							filterFiles.push(fd.fileType);
						}
					}
				});

				console.log(res);

				this.setState({ filesDetails: res , filterFiles});
			});
		});
	}

	getIconFromExtension = (fileType) => {
		let fileTypesList = filetypes.filetypes;
		let fileVisual = fileTypesList.find(f => f.fileExtension === fileType);
		if (fileVisual)
			return (fileVisual.fileExtension !== "folder" ? "teal " : "") + fileVisual.icon;
		else
			return "teal file outline icon";
	}

	downloadFile = (file) => {
		let { filesDetails, web3 } = this.state;
		const ipfsManager = new IpfsManager();

		filesDetails.find(fd => fd.uniqueId === file.uniqueId).downloading = true;

		this.setState({ filesDetails });

		ipfsManager.init(async () => {
			let walletAddress = await web3.eth.getAccounts();
			await ipfsManager.retrieveFile(file, walletAddress[0]);
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

	moveToTrashFile = (file) => {
		const { web3, filesDetails } = this.state;

		filesDetails.find(fd => fd.uniqueId === file.uniqueId).deleting = true;
		this.setState({ filesDetails });

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.setTrashFile(file.uniqueId, file.name, true);
			filesDetails.find(fd => fd.uniqueId === file.uniqueId).deleting = false;
			this.setState({ filesDetails });

			this.retrieveFiles();
		});
	}

	moveToTrashFolder = (folder) => {
		const { web3, filesDetails } = this.state;

		filesDetails.find(fd => fd.uniqueId === folder.uniqueId).deleting = true;
		this.setState({ filesDetails });

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.setTrashFolder(folder.uniqueId, true);
			filesDetails.find(fd => fd.uniqueId === folder.uniqueId).deleting = false;
			this.setState({ filesDetails });

			this.retrieveFiles();
		});
	}

	restoreFile = (file) => {
		const { web3, filesDetails } = this.state;

		filesDetails.find(fd => fd.uniqueId === file.uniqueId).restoring = true;
		this.setState({ filesDetails });

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.setTrashFile(file.uniqueId, file.name, false);
			filesDetails.find(fd => fd.uniqueId === file.uniqueId).restoring = false;
			this.setState({ filesDetails });

			this.retrieveFiles();
		});
	}

	restoreFolder = (folder) => {
		const { web3, filesDetails } = this.state;

		filesDetails.find(fd => fd.uniqueId === folder.uniqueId).restoring = true;
		this.setState({ filesDetails });

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.setTrashFolder(folder.uniqueId, false);
			filesDetails.find(fd => fd.uniqueId === folder.uniqueId).restoring = false;
			this.setState({ filesDetails });

			this.retrieveFiles();
		});
	}

	changeCurrentFolder = async (uniqueId, name, parentFolderId) => {
		let { currentPage, updateCurrentFolder, path, pathTrash } = this.state;
		if (currentPage === "files") {
			await this.setState({ currentFolder: { id: uniqueId, name: name, parentFolderId: parentFolderId } })

			let found = false;
			for (let i = 0; i < path.length; i++) {
				if (path[i].id === uniqueId) {
					path.length = i + 1;
					found = true;
				}
			}
			if (!found) {
				path.push(this.state.currentFolder)
			}

			await this.setState({ path })
			updateCurrentFolder(this.state.currentFolder, path);
		}
		else if (currentPage === "trash") {
			await this.setState({ currentFolderTrash: { id: uniqueId, name: name, parentFolderId: parentFolderId } })

			let found = false;
			for (let i = 0; i < pathTrash.length; i++) {
				if (pathTrash[i].id === uniqueId) {
					pathTrash.length = i + 1;
					found = true;
				}
			}
			if (!found) {
				pathTrash.push(this.state.currentFolderTrash)
			}

			await this.setState({ pathTrash })
		}
	}

	goToParentFolder = async () => {
		const { currentPage, updateCurrentFolder, filesDetails, currentFolder, currentFolderTrash } = this.state;
		if (currentPage === "files") {
			let { path } = this.state;
			path.pop()
			let parentFolder = currentFolder.parentFolderId === "/" ? { uniqueId: "/", name: "root", parentFolderId: "/" } : filesDetails.filter(fd => fd.uniqueId === currentFolder.parentFolderId)[0];
			await this.setState({ currentFolder: { id: parentFolder.uniqueId, name: parentFolder.name, parentFolderId: parentFolder.parentFolderId }, path })
			updateCurrentFolder(this.state.currentFolder, path);
		}
		else if (currentPage === "trash") {
			let { pathTrash } = this.state;
			pathTrash.pop()
			let parentFolder = currentFolderTrash.parentFolderId === "/" ? { uniqueId: "/", name: "root", parentFolderId: "/" } : filesDetails.filter(fd => fd.uniqueId === currentFolderTrash.parentFolderId)[0];
			await this.setState({ currentFolderTrash: { id: parentFolder.uniqueId, name: parentFolder.name, parentFolderId: parentFolder.parentFolderId }, pathTrash })
		}
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

	renderRestoring = () => {
		return (
			<div className="ui active inverted dimmer">
				<div className="ui text loader">Restoring...</div>
			</div>);
	}

	renderFile = (fd, index) => {
		const { currentPage } = this.state;
		const { fileType, uniqueId, name, isFavorite, downloading, favoriting, deleting, restoring } = fd;
		return (
			<div className="ui teal card" key={index}>
				{downloading ? this.renderDownloading() : ""}
				{favoriting ? this.renderFavoriting() : ""}
				{deleting ? this.renderDeleting() : ""}
				{restoring ? this.renderRestoring() : ""}
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
							{currentPage !== "trash" ? <>
								<div className="item" onClick={() => { this.downloadFile(fd) }}>
									<i className="download icon"></i>
        							Download
        						</div>
								<RenameFilePopup retrieveFiles={this.retrieveFiles} uniqueId={uniqueId} name={name} web3={this.state.web3} />
								<div className="item" onClick={() => { this.setFavorite(fd) }}>
									<i className={isFavorite ? 'yellow star icon' : 'yellow outline star icon'}></i>
									{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
								</div></> :
								<div className="item" onClick={() => { this.restoreFile(fd) }}>
									<i className="folder icon"></i>
									Restore File
								</div>
							}
							<Dropdown.Divider />
							<div className="item" onClick={currentPage === "trash" ? () => this.deleteFile(fd) : () => this.moveToTrashFile(fd)}>
								<i className="red trash icon"></i>
								{currentPage === "trash" ? 'Delete Permanently' : 'Move to Trash'}
							</div>
						</Dropdown.Menu>
					</Dropdown>
				</div>
			</div>
		);
	}

	renderFolder = (fd, index) => {
		const { currentPage } = this.state;
		const { fileType, uniqueId, name, parentFolderId, deleting, restoring } = fd;
		return (
			<div className="ui teal card" key={index} onClick={() => { this.changeCurrentFolder(uniqueId, name, parentFolderId) }}>
				{deleting ? this.renderDeleting() : ""}
				{restoring ? this.renderRestoring() : ""}
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
							{currentPage !== "trash" ? <>
								<RenameFilePopup retrieveFiles={this.retrieveFiles} uniqueId={uniqueId} name={name} web3={this.state.web3} /></> :
								<div className="item" onClick={() => { this.restoreFolder(fd) }}>
									<i className="folder icon"></i>
									Restore Folder
								</div>}
							<Dropdown.Divider />
							<div className="item" onClick={currentPage === "trash" ? () => this.deleteFolder(fd) : () => this.moveToTrashFolder(fd)}>
								<i className="red trash icon"></i>
								{currentPage === "trash" ? 'Delete Permanently' : 'Move to Trash'}
							</div>
						</Dropdown.Menu>
					</Dropdown>
				</div>
			</div>
		);
	}

	renderFilesDetails = () => {
		const { filesDetails, currentPage, currentFolder, currentFolderTrash, searchValue, currentFileFilter } = this.state;
		if (filesDetails == null) return null;
		let filesDetailsFiltered = null;

		if(currentFileFilter !== "") {
			filesDetailsFiltered = filesDetails.filter(fd => fd.fileType === currentFileFilter || fd.fileType === "folder");
		}
		else{
			filesDetailsFiltered = filesDetails;
		}

		switch (currentPage) {
			case "favorites":
				filesDetailsFiltered = filesDetailsFiltered.filter(fd => fd.isFavorite === true && fd.fileType !== "folder" && !fd.isTrash);
				break;
			case "recent":

				let date = new Date();
				let dd = String(date.getDate()).padStart(2, '0');
				let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
				let yyyy = date.getFullYear();
				date = mm + '/' + dd + '/' + yyyy;

				filesDetailsFiltered = filesDetailsFiltered.filter(fd => fd.transactionDate === date && fd.fileType !== "folder" && !fd.isTrash);
				break;
			case "trash":
				filesDetailsFiltered = filesDetailsFiltered.filter(fd => fd.parentFolderId === currentFolderTrash.id && fd.isTrash);
				break;
			case "search":
				if (searchValue === "") {
					filesDetailsFiltered = [];
				}
				else {
					filesDetailsFiltered = filesDetailsFiltered.filter(fd => fd.name.toUpperCase().includes(searchValue) && fd.fileType !== "folder" && !fd.isTrash);
				}
				break;
			default:
				filesDetailsFiltered = filesDetailsFiltered.filter(fd => fd.parentFolderId === currentFolder.id && !fd.isTrash);
				break;
		}

		return filesDetailsFiltered.map((fd, index) => {
			if (fd.fileType !== "folder") {
				return this.renderFile(fd, index);
			}
			else {
				return this.renderFolder(fd, index);
			}
		});
	}

	renderPath = () => {
		const { currentPage, path, pathTrash } = this.state;
		if (currentPage === "files") {
			return path.map((folder, index) => {
				return (<><div className="ui icon label" key={index} style={{ cursor: "pointer" }} onClick={() => this.changeCurrentFolder(folder.id, folder.name, folder.parentFolderId)}>
					<i className="folder icon" />
					{folder.name}
				</div>{index !== path.length - 1 ? ">" : ""}</>);
			});
		}
		if (currentPage === "trash") {
			return pathTrash.map((folder, index) => {
				return (<><div className="ui icon label" key={index} style={{ cursor: "pointer" }} onClick={() => this.changeCurrentFolder(folder.id, folder.name, folder.parentFolderId)}>
					<i className="folder icon" />
					{folder.name}
				</div>{index !== pathTrash.length - 1 ? ">" : ""}</>);
			});
		}
	}


	renderFilters = () => {
		const { filterFiles } = this.state;
		const fileTypesList = filetypes.filetypes;
		return (

			<Dropdown text='Filter Files ' icon='filter'>
				<Dropdown.Menu>
					{filterFiles.map((f, index) => {
						let fileType = fileTypesList.find(ft => ft.fileExtension === f);
						if(fileType)
							return (
							<div className="item" key={index} onClick={() => this.setState({currentFileFilter: f})}>
								<span><i className={fileType.icon} style={{fontSize: "20px"}}></i>
								{fileType.text}</span>
							</div>
							);
						else return "";
					})}
					<Dropdown.Divider />
					<div className="item" onClick={() => this.setState({currentFileFilter: ""})}>
						<i className="file outline icon" style={{fontSize: "20px"}}></i>
							All Files
					</div>
				</Dropdown.Menu>
			</Dropdown>

		);
	}

	orderBy = (type) => {
		const { filesDetails } = this.state
		switch (type) {
			case "AZdown":
				filesDetails.sort(function (a, b) {
					if (a.name.toUpperCase() < b.name.toUpperCase()) { return -1; }
					if (a.name.toUpperCase() > b.name.toUpperCase()) { return 1; }
					return 0;
				});
				break;
			case "AZup":
				filesDetails.sort(function (a, b) {
					if (a.name.toUpperCase() > b.name.toUpperCase()) { return -1; }
					if (a.name.toUpperCase() < b.name.toUpperCase()) { return 1; }
					return 0;
				});
				break;
			case "Datedown":
				filesDetails.sort(function (a, b) {
					if (a.transactionDate < b.transactionDate) { return -1; }
					if (a.transactionDate > b.transactionDate) { return 1; }
					return 0;
				});
				break;
			case "Dateup":
				filesDetails.sort(function (a, b) {
					if (a.transactionDate > b.transactionDate) { return -1; }
					if (a.transactionDate < b.transactionDate) { return 1; }
					return 0;
				});
				break;
			default:
				break;
		}
		this.setState(filesDetails);

	}

	renderOrderBy = () => {
		return (
			<Dropdown text='Order Files ' icon='sort' style={{ marginLeft: "30px" }}>
				<Dropdown.Menu>
					<div className="item" onClick={() => { this.orderBy("AZdown") }}>
						<i class="sort alphabet down icon"></i>
							A to Z
						</div>
					<div className="item" onClick={() => { this.orderBy("AZup") }} >
						<i class="sort alphabet up icon"></i>
							Z to A
						</div>
					<div className="item" onClick={() => { this.orderBy("Datedown") }} >
						<i className="sort amount down icon"></i>
							Date su
						</div>
					<div className="item" onClick={() => { this.orderBy("Dateup") }} >
						<i className="sort amount up icon"></i>
							Date giu
						</div>
				</Dropdown.Menu>
			</Dropdown>
		);
	}

	render() {
		const { currentFolder, currentFolderTrash, currentPage } = this.state;
		if ((currentFolder.id === "/" || currentPage === "trash") && (currentFolderTrash.id === "/" || currentPage === "files")) return (
			<>
				<span>
					{currentPage === "files" || currentPage === "trash" ? this.renderPath() : ""}
				</span>
				<br /><br />
				<div style={{ textAlign: "left" }}>
					{this.renderFilters()} {this.renderOrderBy()}<br />
				</div>
				<br /><br />
				<div className="ui eight doubling cards">
					{this.renderFilesDetails()}
				</div></>);
		else return (
			<>
				<span>
					{this.renderPath()}
				</span>
				<br /><br />
				<div style={{ textAlign: "left" }}>
					{this.renderFilters()} {this.renderOrderBy()}<br />
				</div>
				<br /><br />
				<div className="ui eight doubling cards">
					<div className="ui teal card" onClick={() => { this.goToParentFolder() }}>
						<div className="content" style={{ backgroundColor: "#00ACA3", color: "white" }}>
							<i className="inverted folder icon" style={{ fontSize: "30px" }}></i>
							<br /><br />
							<span className="header"
								data-tooltip={"Previus folder"}
								data-position="top center"
								style={{ cursor: "pointer" }} >
								<i className="inverted arrow left icon" style={{ fontSize: "15px" }}></i>
							</span>
							<br />
						</div>
					</div>
					{this.renderFilesDetails()}
				</div>
			</>
		);
	}
}

export default FileViewer;