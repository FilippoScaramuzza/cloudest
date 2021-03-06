import Axios from 'axios';
import ipfsClient from 'ipfs-http-client';
import fileDownload from 'js-file-download';
import EncryptionManager from './EncryptionManager';

class IpfsManager {
	constructor() {
		this.file = null;
		this.ipfs = null;
		this.fileAdded = null;
	}

	init = async (callback) => {
		const ipfs = new ipfsClient({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
		this.ipfs = ipfs;
		callback.bind(this)();
	}

	uploadFile = async (file, key) => { 
		const { ipfs } = this;
		this.file = file;
		let buffer = Buffer.from(await file.arrayBuffer()); 
		
		const encryptionManager = new EncryptionManager();
		buffer = encryptionManager.encrypt(buffer, key);

		const fileAdded = await ipfs.add({ content: buffer }); 
		return fileAdded.cid.string; 
	}
	
	retrieveFile = async (file, key) => {
		await Axios({
			url: 'https://ipfs.io/ipfs/' + file.uniqueId,
			method: "GET",
			responseType: "arraybuffer",
		}).then(res => {
			const encryptionManager = new EncryptionManager();
			let buffer = encryptionManager.decrypt(Buffer.from(res.data), key);
			fileDownload(buffer, file.name);
		});
	}

	getLink = (uniqueId) => {
		if (uniqueId != null) {
			return "https://ipfs.io/ipfs/" + uniqueId;
		}
		return;
	}
}

export default IpfsManager;