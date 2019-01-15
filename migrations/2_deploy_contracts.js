var LAFAssetRegistry = artifacts.require("LAFAssetRegistry");
var LAFAssetStorage = artifacts.require("LAFAssetStorage");
var LAFStorageLib = artifacts.require("LAFStorageLib");

module.exports = async(deployer, network, accounts) => {
  // deploy and link lib
  await deployer.deploy(LAFStorageLib)
  await deployer.link(LAFStorageLib, LAFAssetRegistry)
  let registry = await deployer.deploy(LAFAssetRegistry)
  let storage = await deployer.deploy(LAFAssetStorage)

  // make storage and registry be friends :)
  await storage.addAllowedSender(LAFAssetRegistry.address, { from: accounts[0] })
  await registry.setAssetStorageAddress(LAFAssetStorage.address, { from: accounts[0] })

  // unpause registry
  await registry.unpause({ from: accounts[0] })
}