var LAFItemRegistry = artifacts.require("LAFItemRegistry");
var LAFItemStorage = artifacts.require("LAFItemStorage");
var LAFStorageLib = artifacts.require("LAFStorageLib");

module.exports = async(deployer, network, accounts) => {
  // deploy and link LAFStorageLib
  let lib = await deployer.deploy(LAFStorageLib)
  await deployer.link(LAFStorageLib, LAFItemRegistry)

  // deploy LAFItemRegistry
  let registry = await deployer.deploy(LAFItemRegistry)

  // deploy LAFItemStorage
  let storage = await deployer.deploy(LAFItemStorage)
  
  // when we're deploying to local ganache chain, enable service
  if(network === 'development') {
    // make storage and registry be friends :)
    await storage.addAllowedSender(LAFItemRegistry.address, { from: accounts[0] })
    await registry.setItemStorageAddress(LAFItemStorage.address, { from: accounts[0] })

    // unpause registry
    await registry.unpause({ from: accounts[0] })
  }

  console.log('==============================================')
  console.log('Contract addresses (' + network + '):')
  console.log('LAFStorageLib:', lib.address)
  console.log('LAFItemStorage:', storage.address)
  console.log('LAFItemRegistry:', lib.registry)
  console.log('==============================================')
}