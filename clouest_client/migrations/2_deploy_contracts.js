var FileDetailsManager = artifacts.require("./FileDetailsManager.sol");

module.exports = function(deployer) {
  deployer.deploy(FileDetailsManager);
};
