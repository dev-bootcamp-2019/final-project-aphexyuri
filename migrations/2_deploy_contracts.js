// var LAFItemLib = artifacts.require("./LAFItem.sol");
// var LAF = artifacts.require("./LAF.sol");
// var LAFItemStorage = artifacts.require("./LAFItemStorage.sol");

var LAFAssetRegistry = artifacts.require("./LAFAssetRegistry.sol");
var LAFAssetStorage = artifacts.require("./LAFAssetStorage.sol");

module.exports = function(deployer) {
    // deployer.deploy(LAFItemLib);
    // deployer.link(LAFItemLib, LAF);
    // deployer.link(LAFItemLib, LAFItemStorage);
  	// deployer.deploy(LAF);
    // deployer.deploy(LAFItemStorage);
    
    deployer.deploy(LAFAssetRegistry);
    deployer.deploy(LAFAssetStorage);
};
