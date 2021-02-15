import React, { Component } from 'react';

class App extends Component {
  render() {

    let colors = ["red", "yellow", "orange", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"];
    let randIcon = colors[Math.floor(Math.random() * colors.length)] + " ethereum icon";
    //let randButton = "ui " + colors[Math.floor(Math.random() * colors.length)] + " right labeled icon button";
    let randButton = "ui teal right labeled icon button";

    return (
      <div className="App padded" style={{ margin: "20px", textAlign: "center" }}>
        <h2 className="ui center aligned icon header">
          <i className={randIcon}></i>
        Withdraw from Cloudest Faucet
        </h2>
        <div className="sub header">The Cloud We Deserve<span role="img" aria-label="heart">❤️</span></div><br />
        <div className="sub header">Ether available on the Faucet</div>
        <div className="sub header">Ether owned by you</div>

        <div className="ui action input" style={{ margin: "20px" }}>
          <input type="text" name="amountRequested" />
          <button className={randButton} >
            <i className="cart plus icon"></i>
            Withdraw
        </button>
        </div>
      </div>
    );
  }
}

export default App;
