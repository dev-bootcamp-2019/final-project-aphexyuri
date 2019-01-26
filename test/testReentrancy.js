const LAFItemRegistry = artifacts.require("./LAFItemRegistry.sol")
const LAFItemStorage = artifacts.require("./LAFItemStorage.sol")

// delay helper
const delay = ms => new Promise(res => setTimeout(res, ms));

// test is based on calling multiple withdrawls ensuring no reentrancy attack is possible

contract("LAFItemRegistry (Withdrawl reentrancy)", accounts => {
  var contractsOwner = accounts[0]
  var creator = accounts[1]
  var matcher = accounts[2]

  var itemRegistryInstance
  var itemStorageInstance
  var itemId

  var reward
    
  beforeEach(async function () {
    // 1. deploy new contract intstances
    itemRegistryInstance = await LAFItemRegistry.new({ from: contractsOwner })
    itemStorageInstance = await LAFItemStorage.new({ from: contractsOwner })

    // 2. set storage address
    await itemRegistryInstance.setItemStorageAddress(itemStorageInstance.address, { from: contractsOwner })

    // 3. set registry as allowed sender on storage
    await itemStorageInstance.addAllowedSender(itemRegistryInstance.address, { from: contractsOwner })

    // 4. enable registry
    await itemRegistryInstance.unpause()

    // 5. create item
    let titleStr = "Item Title Placeholder"
    let descriptionStr = "This is some rando placeholder content added during testing"
    let countryIso = "CAN"
    let stateProvince = "NS"
    let city = "Halifax"

    reward = web3.utils.toWei("2", 'ether')

    // call newLostItem
    let { logs } =  await itemRegistryInstance.newLostItem(
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

    itemId = logs.find(x => x.event === 'ItemStored').args.itemId;
    
    // 6. call foundLostItem
    await itemRegistryInstance.foundLostItem(
      itemId,
      "Details of where what etc",
      "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
      18,32,
      { from: matcher })
    
    // 7. call matchConfirmed
    await itemRegistryInstance.matchConfirmed(itemId, "", { from: creator })

    // 8. call itemRecovere\]

    await itemRegistryInstance.itemRecovered(itemId, { from: creator })
  })

  // test that the the account's claimable rewards is equal to the rewards initially made available for the item
  it('...matcher claimableRewards = initial reward', async () => {
    let claimableRewards = await itemRegistryInstance.getClaimableRewards({ from: matcher })
    // console.log('claimableRewards', claimableRewards)
    assert.equal(claimableRewards, reward)
  })

  // run consecutive withdrwal attemps. ideally, the caimable rewards should be set to zero, and thus sonsecutive attempts have no effect
  it('...attempt 3x withdrawls', async () => {
    let contractBalanceBefore = await web3.eth.getBalance(itemRegistryInstance.address)
    // console.log('contractBalanceBefore', contractBalanceBefore)

    let matcherBalanceBefore = await web3.eth.getBalance(matcher)
    // console.log('matcherBalanceBefore', matcherBalanceBefore)

    for(let i = 0; i < 3; i++) {
      // console.log('withdraw now...')
      itemRegistryInstance.withdrawRewards( {from: matcher} )
    }

    // times assumed based on 5 second block time for ganache cli
    // console.log('waiting 20 seconds...')
    await delay(20000);

    let contractBalanceAfter = await web3.eth.getBalance(itemRegistryInstance.address)
    // console.log('contractBalanceAfter', contractBalanceAfter)

    let matcherBalanceAfter = await web3.eth.getBalance(matcher)
    // console.log('matcherBalanceAfter', matcherBalanceAfter)
  })
})

