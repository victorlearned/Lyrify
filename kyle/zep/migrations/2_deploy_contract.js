const LyricfyToken = artifacts.require("LyricfyToken");

module.exports = function(deployer) {
	deployer.deploy(LyricfyToken);
};
