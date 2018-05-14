// var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var LyrifyTokenFactory = artifacts.require("./LyrifyTokenFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(LyrifyTokenFactory);
};
