pragma solidity >=0.4.21 <0.7.0;

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
    mapping(address => FileDetails) filesList;

    /* 
     * When calling this function, the file's information are mapped to address 
     * of the user.
    */
    function addFile(string memory fileHash, string memory fileName, string memory fileType, string memory date) public {
        filesList[msg.sender] = FileDetails({
                fileHash: fileHash,
                fileName: fileName,
                fileExtension: fileType,
                transactionDate: date
            });
    }

    /* 
     * TODO: description of returned values
    */
    /*
    function getFiles(uint256 position) public view returns (string memory, string memory, string memory, string memory) {
        FileDetails memory fileToBeRetrieved = filesList[msg.sender][position];
        return (
            fileToBeRetrieved.fileHash,
            fileToBeRetrieved.fileName,
            fileToBeRetrieved.fileExtension,
            fileToBeRetrieved.transactionDate
        );
    }*/
}
