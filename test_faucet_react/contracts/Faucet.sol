pragma solidity >=0.4.21 <0.7.0;
// Our first contract is a faucet
contract Faucet {

    // Give out ether to anyone who asks
    function withdraw(uint withdraw_amount) public {
        // Send the amount to the address that requested it
        msg.sender.transfer(withdraw_amount);
    }

    function getAmountAvailable() public view returns (uint){
        return address(this).balance;
    }

    // Accept any incoming amount
    function () external payable {}
}