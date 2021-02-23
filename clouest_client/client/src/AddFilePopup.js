import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import "./css/AddFilePopup.css";

class AddFilePopup extends Component {
  state = {
    file: null
  }

  fileInputOnChange = (e) => {
    console.log(e.target.files[0]);
    e.target.setAttribute("data-title", e.target.files[0].name + "\n(" + e.target.files[0].size + 0.000001 + " MB)");
  }

  render() {
    return (
      <Popup trigger={<button className="ui teal right labeled icon button"
        style={{ borderRadius: "50px" }} >
        <i className="add icon" ></i>
                Add File
              </button>} modal>

        <div className="modal">
          <h3 className="ui horizontal divider header">
            <i className="teal file icon"></i>
            Add File
          </h3>
          <form className="ui form">
              <div className="form-group inputDnD">
                <input type="file" className="form-control-file text-danger font-weight-bold" id="inputFile" data-title="Drag and drop a file or click here"
                onChange={this.fileInputOnChange} />
              </div>
              <br/>
              <button className="ui teal right labeled icon button" style={{ margin: "auto", display: "block" }}>
                <i className="upload icon"></i>
                Upload File
              </button>
          </form>
        </div>
      </Popup>
    );
  }
}

export default AddFilePopup;