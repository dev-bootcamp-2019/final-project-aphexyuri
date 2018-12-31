// var LAFItemLib = artifacts.require("./LAFItem.sol");
var LAF = artifacts.require("./LAF.sol");
// var LAFItemStorage = artifacts.require("./LAFItemStorage.sol");

module.exports = function(deployer) {
    // deployer.deploy(LAFItemLib);
    // deployer.link(LAFItemLib, LAF);
    // deployer.link(LAFItemLib, LAFItemStorage);
  	deployer.deploy(LAF);
  	// deployer.deploy(LAFItemStorage);
};
