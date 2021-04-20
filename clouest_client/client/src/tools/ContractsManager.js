import { Component } from "react";
import FileDetailsManager from '../contracts/FileDetailsManager.json';

class ContractsManager extends Component{

	constructor(web3) {
		super();
		this.web3 = web3;
		this.accounts = null;
		this.contract = null;
	}

	init =  async (callback) => {

		const { web3 } = this;
		// Use web3 to get the user's accounts.
		const accounts = await web3.eth.getAccounts();
		
		// Get the contract instance.
		const networkId = await web3.eth.net.getId();
		const deployedNetwork = FileDetailsManager.networks[networkId];
		const instance = new web3.eth.Contract(
			FileDetailsManager.abi,
			deployedNetwork && deployedNetwork.address,
		);

		// Set web3, accounts, and contract to the state, and then proceed with an
		// example of interacting with the contract's methods.
		this.web3 = web3;
		this.accounts = accounts;
		this.contract = instance;

		callback.bind(this)();
	}

	addFile = async (ipfsuniqueId, file, parentFolderId) => {
		
		const { accounts, contract } = this;

		let date = new Date();
		let dd = String(date.getDate()).padStart(2, '0');
		let MM = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
		let yyyy = date.getFullYear();

		let hh = String(date.getHours());
		let mm = String(date.getMinutes());
		let ss = String(date.getSeconds());

		date = MM + '/' + dd + '/' + yyyy + " " + hh + ":" + mm + ":" + ss;
		const filesDetails = await this.getFilesDetails();

		let fileName = file.name;
		filesDetails.forEach(fd => {
			if(fd.name === fileName) {
				let splittedString = fileName.split('.');
				splittedString[splittedString.length - 2] = splittedString[splittedString.length - 2].concat(" (1)");
				fileName = splittedString.join(".");
			}
		});

		let fileType = file.type;
		if(fileType === "") {
			let splittedString = fileName.split('.');
			fileType = splittedString[splittedString.length - 1];
		}

		try {
			await contract.methods.addFile(ipfsuniqueId, fileName, fileType, date, parentFolderId).send({ from: accounts[0] });
		} catch (error) {
			console.log(error);
		}
	}
	
	createFolder = async (name, parentFolderId) => {
		const { accounts, contract } = this;
		let date = new Date();
		let dd = String(date.getDate()).padStart(2, '0');
		let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
		let yyyy = date.getFullYear();

		date = mm + '/' + dd + '/' + yyyy;
		try {
			await contract.methods.addFolder(name, date, parentFolderId).send({ from: accounts[0] });
		} catch (error) {
			console.log(error);
		}
	}

	getFilesDetails = async () => {
		const { accounts, contract } = this;
		console.log(accounts, contract)
		let filesDetails = null;
		try {
			filesDetails = await contract.methods.getFiles().call({ from: accounts[0] });
		} catch (error) {
			console.log(error);
		}

		return filesDetails;
	}

	renameFile = async (uniqueId, name, newName) => {
		const { accounts, contract } = this;

		try {
			await contract.methods.renameFileName(uniqueId, name, newName).send({ from: accounts[0] });
		} catch (error) {
			console.log(error);
		}
	}

	setFavorite = async (uniqueId, name, isFavorite) => {
		const { accounts, contract } = this;

		try {
			await contract.methods.setFavorite(uniqueId, name, isFavorite).send({ from: accounts[0] });
		} catch (error) {
			console.log(error);
		}
	}

	deleteFile = async (uniqueId, name) => {
		const { accounts, contract } = this;

		try {
			await contract.methods.deleteFile(uniqueId, name).send({ from: accounts[0] });
		} catch (error) {
			console.log(error);
		}
	}

	deleteFolder = async (uniqueId) => {
		const { accounts, contract } = this;

		try {
			await contract.methods.deleteFolder(uniqueId).send({ from: accounts[0] });
		} catch (error) {
			console.log(error);
		}
	}

	setTrashFile = async (uniqueId, name, isTrash) => {
		const { accounts, contract } = this;
		try {
			await contract.methods.setTrashFile(uniqueId, name, isTrash, true).send({ from: accounts[0] });
		} catch (error) {
			console.log(error);
		}
	}

	setTrashFolder = async (uniqueId, isTrash) => {
		const { accounts, contract } = this;
		try {
			await contract.methods.setTrashFolder(uniqueId, isTrash, true).send({ from: accounts[0] });
		} catch (error) {
			console.log(error);
		}
	}
}

export default ContractsManager;