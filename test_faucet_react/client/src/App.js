import React, { Component } from "react";
import Faucet from "./contracts/Faucet.json";
import getWeb3 from "./getWeb3";
import InputDataDecoder from 'ethereum-input-data-decoder';
import "./App.css";

class App extends Component {
  state = {
    amountRequested: '',
    amountToSend: '',
    transactionCount: 0,
    amountAvailable: null,
    balance: null,
    web3: null,
    accounts: null,
    contract: null,
    transactions: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Faucet.networks[networkId];
      const instance = new web3.eth.Contract(
        Faucet.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });

      this.getAmountAvailable();
      this.getTransactionCount();

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runRequest = async () => {
    const { web3, amountRequested, accounts, contract } = this.state;

    await contract.methods.withdraw(web3.utils.toWei(amountRequested, 'ether')).send({ from: accounts[0] });

    this.setState({ amountRequested: '', transactions: null });
    this.getAmountAvailable();
    this.getTransactionCount();
  };

  getAmountAvailable = async () => {
    const { web3, contract, accounts } = this.state;
     
    let amountAvailable = await contract.methods.getAmountAvailable().call();

    let balance = await web3.eth.getBalance(accounts[0]);
    let rounded_balance = Math.round((Number(web3.utils.fromWei(balance, "ether")) + Number.EPSILON) * 100) / 100;
    let rounded_amountAvailable = Math.round((Number(web3.utils.fromWei(amountAvailable, "ether")) + Number.EPSILON) * 100) / 100;
    this.setState({ balance: rounded_balance, amountAvailable: rounded_amountAvailable })
  }

  changeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    if (isFinite(String(val)) || val === '') {
      if (nam === "amountRequested") {
        this.setState({ amountRequested: val });
      }
      else {
        this.setState({ amountToSend: val });
      }
    }
  }

  sendEtherToFaucet = async () => {
    const { web3, amountToSend, accounts, contract } = this.state;

    await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to: contract._address,
          value: web3.utils.toHex(web3.utils.toWei(amountToSend, "ether"))
        },
      ]
    }).then(() => {
      this.setState({ amountToSend: '', transactions: null });
      this.getAmountAvailable();
      this.getTransactionCount();
    });
  }

  getTransactionCount = async () => {
    const { web3, accounts } = this.state
    let count = await web3.eth.getTransactionCount(accounts[0]);
    this.setState({ transactionCount: count })
  }

  getTransactionList = async () => {
    let { web3, transactions, accounts } = this.state;

    const decoder = new InputDataDecoder(Faucet.abi);

    let lastBlockNumber = await web3.eth.getBlockNumber();
    transactions = [];
    for (let i = lastBlockNumber; i >= 1; i--) {
      // eslint-disable-next-line
      await web3.eth.getBlock(i).then(async res => {
        res.transactions.forEach(async hash => {
          await web3.eth.getTransaction(hash).then(tr => {
            if (tr.from === accounts[0] || tr.to === accounts[0]) {
              transactions.push(tr);
            }
          });
        });
      });

    }

    this.setState({ transactions })
  }

  renderTable = () => {
    const { transactions } = this.state;
    if (transactions == null) return '';
    else {
      return (
        <table className="ui teal table" style={{ width: "auto", marginLeft: "auto", marginRight: "auto" }}>
          <thead>
            <tr><th className="center aligned" >Hash</th>
              <th className="center aligned" >From</th>
              <th className="center aligned" >To</th>
              <th className="center aligned" >Value</th>
            </tr></thead><tbody>
            {this.renderTableData()}
          </tbody>
        </table>);
    }
  }

  renderTableData = () => {
    const { transactions, web3 } = this.state;
    if (transactions == null) return null;
    return transactions.map((tr, index) => {
      const { hash, from, to, value } = tr;
      return (
        <tr key={index} className="center aligned" >
          <td>{hash}</td>
          <td>{from}</td>
          <td>{to}</td>
          <td>{web3.utils.fromWei(value, "ether")}</td>
        </tr>
      )
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    let colors = ["red", "yellow", "orange", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"];
    let randIcon = colors[Math.floor(Math.random() * colors.length)] + " ethereum icon";
    //let randButton = "ui " + colors[Math.floor(Math.random() * colors.length)] + " right labeled icon button";
    let randButton = "ui teal right labeled icon button";

    return (
      <div className="App padded" style={{ margin: "20px" }}>
        <h2 className="ui center aligned icon header">
          <i className={randIcon}></i>
          Withdraw from Cloudest Faucet
        </h2>
        <div className="sub header">The Cloud We Deserve<span role="img" aria-label="heart">❤️</span></div><br />
        <div className="sub header">{this.state.amountAvailable} Ether available on the Faucet</div>
        <div className="sub header">{this.state.balance} Ether owned by you</div>

        <div className="ui action input" style={{ margin: "20px" }}>
          <input type="text" name="amountRequested" value={this.state.amountRequested} onChange={this.changeHandler} />
          <button className={randButton} onClick={this.runRequest}>
            <i className="cart plus icon"></i>
              Withdraw
          </button>
        </div><br />
        or<br />
        <div className="ui action input" style={{ margin: "20px" }}>
          <input type="text" value={this.state.amountToSend} onChange={this.changeHandler} />
          <button className={randButton} onClick={this.sendEtherToFaucet}>
            <i className="ethereum icon"></i>
              Send
          </button>
        </div>
        <br />
        <div className="ui labeled button" tabIndex="0" onClick={this.getTransactionList}>
          <div className="ui basic teal button">
            <i className="exchange icon"></i> Get Transaction List
          </div>
          <span className="ui basic left pointing teal label">
            {this.state.transactionCount}
          </span>
        </div>

        {this.renderTable()}
      </div>
    );
  }
}

export default App;
