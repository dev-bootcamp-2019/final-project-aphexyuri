var LAFAssetRegistry = artifacts.require("LAFAssetRegistry");
var LAFAssetStorage = artifacts.require("LAFAssetStorage");
var LAFStorageLib = artifacts.require("LAFStorageLib")

module.exports = function(deployer) {
    deployer.deploy(LAFAssetRegistry);
    deployer.deploy(LAFAssetStorage);
    deployer.deploy(LAFStorageLib);

    deployer.link(LAFStorageLib, LAFAssetRegistry);
};
