var LAFAssetRegistry = artifacts.require("LAFAssetRegistry");
var LAFAssetStorage = artifacts.require("LAFAssetStorage");
var LAFStorageLib = artifacts.require("LAFStorageLib");

module.exports = async(deployer, network, accounts) => {
  // deploy and link LAFStorageLib
  await deployer.deploy(LAFStorageLib)
  await deployer.link(LAFStorageLib, LAFAssetRegistry)

  // deploy LAFAssetRegistry
  let registry = await deployer.deploy(LAFAssetRegistry)

  // deploy LAFAssetStorage
  let storage = await deployer.deploy(LAFAssetStorage)
  
  // when we're deploying to local ganache chain, enable service
  if(network === 'development') {
    // make storage and registry be friends :)
    await storage.addAllowedSender(LAFAssetRegistry.address, { from: accounts[0] })
    await registry.setAssetStorageAddress(LAFAssetStorage.address, { from: accounts[0] })

    // unpause registry
    await registry.unpause({ from: accounts[0] })
  }
}