var LAFAssetRegistry = artifacts.require("LAFAssetRegistry");
var LAFAssetStorage = artifacts.require("LAFAssetStorage");
var LAFStorageLib = artifacts.require("LAFStorageLib")

module.exports = function(deployer) {
    deployer.deploy(LAFAssetStorage);

    deployer.deploy(LAFStorageLib);
    deployer.link(LAFStorageLib, LAFAssetRegistry);

    deployer.deploy(LAFAssetRegistry);
};