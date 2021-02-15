import React, { Component } from 'react';
import Axios from 'axios';
import ipfsClient from 'ipfs-http-client';
import fileDownload from 'js-file-download';

class App extends Component {
  state = {
    ipfs: null,
    file: null,
    buffer: null,
    fileHash: null,
    fileContent: null,
    buttonType: "ui teal right labeled icon button",
    percentCompleted: 0,
  }

  componentDidMount = async () => {
    const ipfs = new ipfsClient({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
    this.setState({ ipfs });
  }

  changeHandler = (event) => {
    const file = event.target.files[0];
    this.setState({ file });
  };

  uploadFile = () => {
    const { file } = this.state;
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => this.convertToBuffer(reader);

  }

  convertToBuffer = async (reader) => {
    //file is converted to a buffer to prepare for uploading to IPFS
    const buffer = await Buffer.from(reader.result);
    //set this buffer -using es6 syntax
    this.setState({ buffer });

    this.addFile();
  };

  addFile = async () => {
    const { ipfs, buffer } = this.state;

    this.setState({ buttonType: "ui teal right labeled loading disabled icon button" });
    const fileAdded = await ipfs.add({ content: buffer });
    this.setState({ buttonType: "ui teal right labeled icon button" });
    fileAdded.onloadend = () => console.log("pirlone");
    const fileHash = fileAdded.cid;
    this.setState({ fileHash: fileHash.string });
  }

  retrieveFile = async () => {
    const { ipfs, fileHash } = this.state;
    const bytes = [];
    for await (const chunk of ipfs.cat(fileHash)) {
      bytes.push(Buffer.from(chunk));
    }
    const fileContent = (Buffer.concat(bytes).toString());
    this.setState({ fileContent });

    /*await Axios.get('https://ipfs.io/ipfs/' + fileHash, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        console.log("pirla coglione degficiente");
        let percentCompleted = Math.floor(progressEvent.loaded / progressEvent.total * 100)
        console.log(percentCompleted);
        //this.setState({percentCompleted});
      }
    }).then(res => {
      fileDownload(res.data, "prova.pdf");
    });
    //fileDownload(fileContent, "prova.pdf", "application/pdf");*/

    Axios({
      url: 'https://ipfs.io/ipfs/' + fileHash,
      method: "GET",
      responseType: "blob", // important
      onDownloadProgress: (progressEvent) => {
        let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total); // you can use this to show user percentage of file downloaded
        console.log(percentCompleted);
        this.setState({ percentCompleted });
      }
    }).then(res => {
      fileDownload(res.data, "prova.zip");
    });

    //this.showContentFile();
  }

  showContentFile = () => {
    const { fileContent } = this.state;
    if (fileContent != null) {
      return (
        <div className="ui center aligned info message"> <label>{fileContent}</label></div>
      );
    }
    return;
  }


  getLink = () => {
    const { fileHash } = this.state;
    if (fileHash != null) {
      let link = "https://ipfs.io/ipfs/" + fileHash;
      return (
        <a href={link} download="prova.txt">{link}</a>
      );
    }
    return;
  }

  render() {

    let colors = ["red", "yellow", "orange", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"];
    let randIcon = colors[Math.floor(Math.random() * colors.length)] + " world icon";
    let randButton = "ui teal right labeled icon button";

    return (
      <div className="App padded" style={{ margin: "20px", textAlign: "center" }}>
        <h2 className="ui center aligned icon header">
          <i className={randIcon}></i>
        IPFS File Upload Test
        </h2>
        <div className="sub header">The Cloud We Deserve<span role="img" aria-label="heart">❤️</span></div><br />
        <div className="sub header">Use the form below to upload a file to the InterPlanetary File System</div>

        <div className="ui action input" style={{ margin: "20px" }}>
          <input type="file" name="fileToUpload" onChange={this.changeHandler} />
          <button className={this.state.buttonType} onClick={this.uploadFile}>
            <i className="file icon"></i>
            Upload File
        </button>
        </div><br />

        {this.getLink()}

        <br /><br />
        <div className="ui action input" style={{ margin: "20px" }}>

          <button className={randButton} onClick={this.retrieveFile}>
            <i className="eye icon"></i>
              File content
          </button>
        </div><br />

        <div className="ui teal progress" style={{ width: "30%", margin: "auto" }}>
          <div className="bar" style={{ width: this.state.percentCompleted + "%" }}></div>
          <div className="label">Downloading Files</div>
        </div>

        <br />


        {/*this.showContentFile()*/}

      </div>
    );
  }
}

export default App;
