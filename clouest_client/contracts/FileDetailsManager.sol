pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

/*
 * Contract for storing and retrieve file details uploaded to the IPFS
 * P2P network. This is made thanks to a "mapping" data structure, which allows
 * storing all file's information. More information through the source
 * code below.
 */
contract FileDetailsManager {

    /*
     * Structure for file's details.
    */
    struct FileDetails {
        string fileHash; // The IPFS file hash
        string fileName; // The file name
        string transactionDate; // The date in which file infos was stored
        string fileExtension; // The type of file (its extension)
    }

    /*
     * Mapping file details with users account address
    */
    mapping(address => FileDetails[]) filesList;

    /* 
     * When calling this function, the file's information are mapped to address 
     * of the user.
    */
    function addFile(string memory fileHash, string memory fileName, string memory fileType, string memory date) public {
        filesList[msg.sender].push(FileDetails({
                fileHash: fileHash,
                fileName: fileName,
                fileExtension: fileType,
                transactionDate: date
            }));
    }

    /* 
     * TODO: description of returned values
    */
    
    function getFiles() public view returns (FileDetails[] memory) {
        FileDetails[] memory fileToBeRetrieved = filesList[msg.sender];
        return (fileToBeRetrieved);
    }

    /*
    * 
    */
    function renameFileName(string memory fileHash, string memory fileName, string memory newName) public{
        FileDetails[] memory fileToBeRetrieved = filesList[msg.sender];
        for(uint i = 0; i < fileToBeRetrieved.length; i++){
            if(keccak256(bytes(fileToBeRetrieved[i].fileHash)) == keccak256(bytes(fileHash)) && keccak256(bytes(fileToBeRetrieved[i].fileName)) == keccak256(bytes(fileName))) fileToBeRetrieved[i].fileName = newName;
        }
    }

}
