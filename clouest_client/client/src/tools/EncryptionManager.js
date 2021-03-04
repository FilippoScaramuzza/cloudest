import crypto from 'crypto';
import keccak256 from 'keccak256';

class EncryptionManager {
    
    encrypt = (buffer, key) => {
		let cipher, result, iv;

		// Create an iv
		iv = crypto.randomBytes(16);
		// Create a new cipher
		cipher = crypto.createCipheriv('aes-256-ctr', keccak256(key), iv);
		// Create the new chunk
		result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);

		return result;
	}

	decrypt = (buffer, key) => {
		var decipher, result, iv;
		// Get the iv: the first 16 bytes
		iv = buffer.slice(0, 16);
		// Get the rest
		buffer = buffer.slice(16);
		// Create a decipher
		decipher = crypto.createDecipheriv('aes-256-ctr', keccak256(key), iv);
		// Actually decrypt it
		result = Buffer.concat([decipher.update(buffer), decipher.final()]);

		return result;
	}
}

export default EncryptionManager;