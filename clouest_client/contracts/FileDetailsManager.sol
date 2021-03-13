pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

/*
 * Contract for storing and retrieving file details uploaded to the IPFS
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
        string parentFolderId;
        bool isFavorite;
        bool isTrash;
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
    function addFile(string memory uniqueId, string memory name, string memory fileType, string memory date, string memory parentFolderId) public {
        filesList[msg.sender].push(FileDetails({
                uniqueId: uniqueId,
                name: name,
                fileType: fileType,
                transactionDate: date,
                parentFolderId: parentFolderId,
                isFavorite: false,
                isTrash: false
            }));
    }

    /* 
     * When calling this function, the folder's information are mapped to address 
     * of the user.
    */
    function addFolder(string memory name, string memory date, string memory parentFolderId) public {
        filesList[msg.sender].push(FileDetails({
                uniqueId: uint2str(folderId),
                name: name,
                fileType: "folder",
                transactionDate: date,
                parentFolderId: parentFolderId,
                isFavorite: false,
                isTrash: false
            }));
        folderId++;
    }

    /*
     * When calling this function, the specified file is removed from the array
     */
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
     * When calling this funtion, the specified folder is removed from the list.
     * In a recursive way also subfolder and inner files are deleted.
     */
    function deleteFolder(string memory uniqueId) public {
        FileDetails[] storage filesDetails = filesList[msg.sender];
        uint index = 0;
        for(uint i = 0; i < filesDetails.length; i++){

            if(keccak256(bytes(filesDetails[i].uniqueId)) == keccak256(bytes(uniqueId))){
                index = i;
                for(uint j = 0; j < filesDetails.length; j++){
                    
                    if( keccak256(bytes(filesDetails[j].parentFolderId)) == keccak256(bytes(filesDetails[i].uniqueId)) ){
                        if( keccak256(bytes(filesDetails[j].fileType)) == keccak256(bytes("folder")) ){
                            deleteFolder(filesDetails[j].uniqueId);
                        }   
                        if( keccak256(bytes(filesDetails[j].fileType)) != keccak256(bytes("folder")) ){
                            deleteFile(filesDetails[j].uniqueId, filesDetails[j].name);
                        }
                    }
                } 
            }
        }

        for (uint i = index; i < filesDetails.length-1; i++){
            filesDetails[i] = filesDetails[i+1];
        }
        filesDetails.pop();
    }

    /* 
     * When calling this function the array of file owned by the calling wallet 
     * is returned.
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
     * When calling this function the field isFavorite of the specified file gets updated.
    */
    function setFavorite(string memory uniqueId, string memory name, bool  isFavorite) public{
        FileDetails[] storage filesDetails = filesList[msg.sender];
        for(uint i = 0; i < filesDetails.length; i++){
            if(keccak256(bytes(filesDetails[i].uniqueId)) == keccak256(bytes(uniqueId)) && keccak256(bytes(filesDetails[i].name)) == keccak256(bytes(name))) filesDetails[i].isFavorite = isFavorite;
        }
    }

    /*
     * This function act as converter from uint to string.
    */
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

    /*
     * When calling this function the field isTrash of the specified file gets updated.
     */
    function setTrashFile(string memory uniqueId, string memory name, bool isTrash, bool isSingleDelete) public {
        FileDetails[] storage filesDetails = filesList[msg.sender];
        for(uint i = 0; i < filesDetails.length; i++){
            if(keccak256(bytes(filesDetails[i].uniqueId)) == keccak256(bytes(uniqueId)) 
            && keccak256(bytes(filesDetails[i].name)) == keccak256(bytes(name))) {
                filesDetails[i].isTrash = isTrash;
                if(isSingleDelete) {
                    filesDetails[i].parentFolderId = "/";
                }
            }
        }
    }
    /*
     * When calling this function the field isTrash of the specified folder gets updated.
     * In a recursive way also subfolders and inner files get updated.
     */
    function setTrashFolder(string memory uniqueId, bool isTrash, bool isSingleDelete) public {
        FileDetails[] storage filesDetails = filesList[msg.sender];
        for(uint i = 0; i < filesDetails.length; i++){

            if(keccak256(bytes(filesDetails[i].uniqueId)) == keccak256(bytes(uniqueId))){
                filesDetails[i].isTrash = isTrash;
                if(isSingleDelete) {
                    filesDetails[i].parentFolderId = "/";
                }
                for(uint j = 0; j < filesDetails.length; j++){
                    
                    if( keccak256(bytes(filesDetails[j].parentFolderId)) == keccak256(bytes(filesDetails[i].uniqueId)) ){
                        if( keccak256(bytes(filesDetails[j].fileType)) == keccak256(bytes("folder")) ){
                            setTrashFolder(filesDetails[j].uniqueId, isTrash, false);
                        }   
                        if( keccak256(bytes(filesDetails[j].fileType)) != keccak256(bytes("folder")) ){
                            setTrashFile(filesDetails[j].uniqueId, filesDetails[j].name, isTrash, false);
                        }
                    }
                } 
            }
        }      
    }
}