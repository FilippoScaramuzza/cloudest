import React, { Component } from "react";
import ContractsManager from './tools/ContractsManager';
import { Dropdown } from 'semantic-ui-react';

class FileViewer extends Component {
	state = {
		web3: this.props.web3,
		filesDetails: null
	}

	componentDidMount = async () => {
		const { web3 } = this.state;

		const contractsManager = new ContractsManager(web3);
		contractsManager.init(async () => {
			await contractsManager.getFilesDetails().then((res) => {
				this.setState({ filesDetails: res });
				console.log(res);
			});
		});
	}

	getIconFromExtension = (fileExtension) => {
		switch(fileExtension) {
			case "application/pdf":
				return "teal file pdf outline icon";
			case "image/png":
				return "teal file image outline icon";
			case "image/jpg":
				return "teal file image outline icon"
			case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				return "teal file word outline icon"
			default:
				return "teal file outline icon";
		}
	}

	renderFilesDetails = () => {
		const { filesDetails } = this.state;
		if (filesDetails == null) return null;
		return filesDetails.map((fd, index) => {
			const { fileExtension, fileHash, fileName } = fd;
			console.log(fileExtension);
			return (
				<div className="ui teal card" key={index}>
					<div className="content">
						<i className={this.getIconFromExtension(fileExtension)} style={{fontSize: "30px"}}></i>
					</div>
					<div className="content">
						<a href="localhost:3000" className="header" data-tooltip={fileName} data-position="top center">{fileName.replace(/(.{16})..+/, "$1...")}</a>
						<div className="meta">
							<span className="date">{fileHash}</span>
						</div>
						<Dropdown text='Actions'>
							<Dropdown.Menu>
								<Dropdown.Item icon='download' text='Download' />
								<Dropdown.Item icon='i cursor' text='Rename' />
								<Dropdown.Item icon='yellow outline star' text='Add to Favorite' />
								<Dropdown.Divider />
								<Dropdown.Item icon='red trash' text='Delete' />
							</Dropdown.Menu>
						</Dropdown>
					</div>
				</div>
			);
		});
	}

	render() {
		return (
			<div className="ui eight doubling cards">
				{this.renderFilesDetails()}
			</div>
		);
	}
}

export default FileViewer;