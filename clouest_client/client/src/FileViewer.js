import React, { Component } from "react";
import ContractsManager from './tools/ContractsManager';
import logo from './img/logo.svg';

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

	renderFilesDetails = () => {
		const { filesDetails } = this.state;
		if (filesDetails == null) return null;
		return filesDetails.map((fd, index) => {
			const { fileHash, fileName, transactionDate, fileExtension } = fd;
			return (
				<div className="ui card" key={index} style={{float: "left", margin: "20px"}}>
					<div className="image">
						<img src={logo} alt="logo"/>
					</div>
					<div className="content">
						<a href="localhost:3000" className="header">{fileName}</a>
						<div className="meta">
							<span className="date">{fileHash}</span>
						</div>
						<div className="description">
							{fileExtension}
              </div>
					</div>
					<div className="extra content">
							<i className="calendar icon"></i>
              {transactionDate}
					</div>
				</div>
			)
		})
	}

	render() {
		return (
			<div>
				{this.renderFilesDetails()}
			</div>

		);
	}
}

export default FileViewer;