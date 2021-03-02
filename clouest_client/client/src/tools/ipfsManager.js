import Axios from 'axios';
import ipfsClient from 'ipfs-http-client';
import fileDownload from 'js-file-download';
//import crypto from 'crypto';

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

	uploadFile = async (file) => { 
		const { ipfs } = this; 
		this.file = file; 
		const buffer = Buffer.from(await file.arrayBuffer()); 
		const fileAdded = await ipfs.add({ content: buffer }); 
		return fileAdded.cid.string; };
	/*
	encrypt = (buffer) => {
		const {accounts} = this.state;

		let cipher, result, iv;
		// Create an iv
		iv = crypto.randomBytes(16);
		// Create a new cipher
		cipher = crypto.createCipheriv('aes-256-ctr', 'bncaskdbvasbvlaslslasfhjaaaaaaaa', iv);
		// Create the new chunk
		result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);

		return result;
	}

	decrypt = (buffer) => {
		var decipher, result, iv;
		// Get the iv: the first 16 bytes
		iv = buffer.slice(0, 16);
		// Get the rest
		buffer = buffer.slice(16);
		// Create a decipher
		decipher = crypto.createDecipheriv('aes-256-ctr', 'bncaskdbvasbvlaslslasfhjaaaaaaaa', iv);
		// Actually decrypt it
		result = Buffer.concat([decipher.update(buffer), decipher.final()]);

		return result;
	}*/
	
	retrieveFile = async (file) => {
		await Axios({
			url: 'https://ipfs.io/ipfs/' + file.uniqueId,
			method: "GET",
			responseType: "arraybuffer", // important
		}).then(res => {
			fileDownload(Buffer.from(res.data), file.fileName);
		});
	}

	getLink = (uniqueId) => {
		if (uniqueId != null) {
			return "https://ipfs.io/ipfs/" + uniqueId;
		}
		return;
	}

	/*renderProgressBar = () => {
		const { percentCompleted } = this.state;

		return (
			<div className="ui teal progress" style={{ width: "30%", margin: "auto" }}>
				<div className="bar" style={{ width: percentCompleted + "%" }}></div>
				<div className="label">Downloading Files</div>
			</div>);
	}*/
}

export default IpfsManager;