const LAFAssetRegistry = artifacts.require("./LAFAssetRegistry.sol")
const LAFAssetStorage = artifacts.require("./LAFAssetStorage.sol")

// delay helper
const delay = ms => new Promise(res => setTimeout(res, ms));

contract("LAFAssetRegistry (Withdrawl reentrancy)", accounts => {
  var contractsOwner = accounts[0]
  var creator = accounts[1]
  var matcher = accounts[2]

  var assetRegistryInstance
  var assetStorageInstance
  var assetId

  var reward
    
  beforeEach(async function () {
    // 1. deploy new contract intstances
    assetRegistryInstance = await LAFAssetRegistry.new({ from: contractsOwner })
    assetStorageInstance = await LAFAssetStorage.new({ from: contractsOwner })

    // 2. set storage address
    await assetRegistryInstance.setAssetStorageAddress(assetStorageInstance.address, { from: contractsOwner })

    // 3. set registry as allowed sender on storage
    await assetStorageInstance.addAllowedSender(assetRegistryInstance.address, { from: contractsOwner })

    // 4. enable registry
    await assetRegistryInstance.unpause()

    // 5. create asset
    let titleStr = "Asset Title Placeholder"
    let descriptionStr = "This is some rando placeholder content added during testing"
    let countryIso = "CAN"
    let stateProvince = "NS"
    let city = "Halifax"

    reward = web3.utils.toWei("2", 'ether')

    // call newLostAsset
    let { logs } =  await assetRegistryInstance.newLostAsset(
      titleStr,
      descriptionStr,
      web3.utils.asciiToHex(countryIso),
      web3.utils.asciiToHex(stateProvince),
      web3.utils.asciiToHex(city),
      "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
      18,
      32,
      { from: creator, value: reward }
    )

    assetId = logs.find(x => x.event === 'AssetStored').args.assetId;
    
    // 6. call foundLostAsset
    await assetRegistryInstance.foundLostAsset(
      assetId,
      "Details of where what etc",
      "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
      18,32,
      { from: matcher })
    
    // 7. call matchConfirmed
    await assetRegistryInstance.matchConfirmed(assetId, "", { from: creator })

    // 8. call assetRecovere\]

    await assetRegistryInstance.assetRecovered(assetId, { from: creator })
  })

  it('...matcher claimableRewards = initial reward', async () => {
    let claimableRewards = await assetRegistryInstance.getClaimableRewards({ from: matcher })
    // console.log('claimableRewards', claimableRewards)
    assert.equal(claimableRewards, reward)
  })


  it('...attempt 3x withdrawls', async () => {
    let contractBalanceBefore = await web3.eth.getBalance(assetRegistryInstance.address)
    // console.log('contractBalanceBefore', contractBalanceBefore)

    let matcherBalanceBefore = await web3.eth.getBalance(matcher)
    // console.log('matcherBalanceBefore', matcherBalanceBefore)

    for(let i = 0; i < 3; i++) {
      // console.log('withdraw now...')
      assetRegistryInstance.withdrawRewards( {from: matcher} )
    }

    // times assumed based on 5 second block time for ganache cli
    // console.log('waiting 20 seconds...')
    await delay(20000);

    let contractBalanceAfter = await web3.eth.getBalance(assetRegistryInstance.address)
    // console.log('contractBalanceAfter', contractBalanceAfter)

    let matcherBalanceAfter = await web3.eth.getBalance(matcher)
    // console.log('matcherBalanceAfter', matcherBalanceAfter)
  })
})

