// var SimpleStorage = artifacts.require("./SimpleStorage.sol");
// var LyrifyTokenFactory = artifacts.require("./LyrifyTokenFactory.sol");

var LyrifyToken = artifacts.require("./LyrifyTokenOwnership.sol");

module.exports = function(deployer) {
  deployer.deploy(LyrifyToken);
};
