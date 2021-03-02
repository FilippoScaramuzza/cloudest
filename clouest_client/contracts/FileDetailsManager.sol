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
     * Structure for files' details and folders' details.
    */
    struct FileDetails {
        string uniqueId; // If isFolder==true -> unique id of the folder, otherwise it's IPFS fileHash.
        string name; // name of the folder or of the file.
        string transactionDate; // The date in which file infos was stored.
        string fileType; // "folder" if folder, the extension of the file otherwise.
        bool isFavorite;
    }

    /*
     * Mapping file details with users account address
    */
    mapping(address => FileDetails[]) filesList;
    uint folderId = 0;
    /* 
     * When calling this function, the file's information are mapped to address 
     * of the user.
    */
    function addFile(string memory uniqueId, string memory name, string memory fileType, string memory date) public {
        filesList[msg.sender].push(FileDetails({
                uniqueId: uniqueId,
                name: name,
                fileType: fileType,
                transactionDate: date,
                isFavorite: false
            }));
    }

    /* 
     * When calling this function, the folder's information are mapped to address 
     * of the user.
    */
    function addFolder(string memory name, string memory date) public {
        filesList[msg.sender].push(FileDetails({
                uniqueId: uint2str(folderId),
                name: name,
                fileType: "folder",
                transactionDate: date,
                isFavorite: false
            }));
        folderId++;
    }


    
    function uint2str(uint i) internal pure returns (string memory uintAsString) {
        if (i == 0) {
            return "0";
        }
        uint j = i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (i != 0) {
            bstr[k--] = byte(uint8(48 + i % 10));
            i /= 10;
        }
        return string(bstr);
    }

    function deleteFile(string memory uniqueId, string memory name) public {
        FileDetails[] storage filesDetails = filesList[msg.sender];
        uint index = 0;
        for(uint i = 0; i < filesDetails.length; i++){
            if(keccak256(bytes(filesDetails[i].uniqueId)) == keccak256(bytes(uniqueId)) 
            && keccak256(bytes(filesDetails[i].name)) == keccak256(bytes(name))) {
                index = i;
            }
        }

        for (uint i = index; i < filesDetails.length-1; i++){
            filesDetails[i] = filesDetails[i+1];
        }
        filesDetails.pop();
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
    function renameFileName(string memory uniqueId, string memory name, string memory newName) public{
        FileDetails[] storage filesDetails = filesList[msg.sender];
        for(uint i = 0; i < filesDetails.length; i++){
            if(keccak256(bytes(filesDetails[i].uniqueId)) == keccak256(bytes(uniqueId)) && keccak256(bytes(filesDetails[i].name)) == keccak256(bytes(name))) filesDetails[i].name = newName;
        }
    }


    /*
     *
    */
    function setFavorite(string memory uniqueId, string memory name, bool  isFavorite) public{
        FileDetails[] storage filesDetails = filesList[msg.sender];
        for(uint i = 0; i < filesDetails.length; i++){
            if(keccak256(bytes(filesDetails[i].uniqueId)) == keccak256(bytes(uniqueId)) && keccak256(bytes(filesDetails[i].name)) == keccak256(bytes(name))) filesDetails[i].isFavorite = isFavorite;
        }
    }
}
