import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import "./css/AddFilePopup.css";

class AddFilePopup extends Component {
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
              <div class="field">
                <input type="file" />
              </div>

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