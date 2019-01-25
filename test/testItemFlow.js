const LAFItemRegistry = artifacts.require("./LAFItemRegistry.sol")
const LAFItemStorage = artifacts.require("./LAFItemStorage.sol")

getAddressEtherBalanceFloat = async (address) => {
    return parseFloat(web3.utils.fromWei(await web3.eth.getBalance(address), 'ether'))
}

// Tests are mainly of a functional nature, testing corefunctionality of creating an item and taking it through its various statuses

contract("LAFItemRegistry (Item Flows)", accounts => {
    var contractsOwner = accounts[0]
    var creator = accounts[1]
    var matcher = accounts[2]

    var itemRegistryInstance
    var itemStorageInstance
    var itemId

    var reward

    // deploy new instances of the contract(s); create a new item
    beforeEach(async function () {
        // 1st time system setup...

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
    })

    // ideal item flow round-trip
    // assert withdrawl amounts
    it('...newLostItem -> potentialMatch -> matchConfirmed -> itemRecovered -> withdrawl', async () => {
        let itemStatus = (await itemRegistryInstance.getItem(itemId)).itemStatus
        assert.equal(itemStatus, 1)

        // call potentialMatch
        await itemRegistryInstance.foundLostItem(
            itemId,
            "Details of where what etc",
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,32,
            { from: matcher })

        itemStatus = (await itemRegistryInstance.getItem(itemId)).itemStatus
        assert.equal(itemStatus, 2)
        
        // call matchConfirmed
        await itemRegistryInstance.matchConfirmed(itemId, "", { from: creator })

        itemStatus = (await itemRegistryInstance.getItem(itemId)).itemStatus
        assert.equal(itemStatus, 3)

        // call itemRecovered
        await itemRegistryInstance.itemRecovered(itemId, { from: creator })

        itemStatus = (await itemRegistryInstance.getItem(itemId)).itemStatus
        assert.equal(itemStatus, 4)

        // test assert the account's claimable reward matches the initial item reward >>> 
        let claimableReward = await itemRegistryInstance.getClaimableRewards({ from: matcher })

        assert.equal(claimableReward, reward, 'Claimable reward for matcher shoud be initial reward amount')
        // <<<

        // test withdrawl >>>
        let matcherBalanceBeforeWithdrawl = await web3.eth.getBalance(matcher)

        // withdraw reward as matcher
        await itemRegistryInstance.withdrawRewards({ from: matcher })

        claimableReward = await itemRegistryInstance.getClaimableRewards({ from: matcher })

        // assert claimable reward has been reset to 0
        assert.equal(claimableReward, 0)

        let matcherBalanceAfterWithdrawl = await web3.eth.getBalance(matcher)
        let targetBalance = web3.utils.toBN(matcherBalanceBeforeWithdrawl).add(web3.utils.toBN(reward))

        // assert matcher's account has received reward after withdrawl
        // @dev NB note - this does not account for gas and will fail occasionally
        assert.equal(
            parseFloat(web3.utils.fromWei(matcherBalanceAfterWithdrawl, 'ether')).toFixed(1),
            parseFloat(web3.utils.fromWei(targetBalance, 'ether')).toFixed(1)
        )
    })

    // item recovery failure flow
    // assert item status reset
    it('...newLostItem -> potentialMatch -> matchConfirmed -> itemRecoveryFailed', async () => {
        // call foundLostItem
        await itemRegistryInstance.foundLostItem(
            itemId,
            "Details of finding items",
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,
            32,
            { from: matcher })
       
        // call matchConfirmed
        await itemRegistryInstance.matchConfirmed(itemId, "", { from: creator })

        // call itemRecovered
        await itemRegistryInstance.itemRecoveryFailed(itemId, { from: creator })

        let itemStatus = (await itemRegistryInstance.getItem(itemId)).itemStatus
        assert.equal(itemStatus, 1)
    })

    // match invalid flow
    // assert item status reset
    it('...newLostItem -> potentialMatch -> matchInvalid', async () => {
        // call foundLostItem
        await itemRegistryInstance.foundLostItem(
            itemId,
            "Details of finding items",
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,
            32,
            { from: matcher })

         // call matchInvalid
         await itemRegistryInstance.matchInvalid(itemId, { from: creator })

         let itemStatus = (await itemRegistryInstance.getItem(itemId)).itemStatus
         assert.equal(itemStatus, 1)
    })

    // cancel item flow
    // assert refund to creator & item cancel state
    it('...newLostItem -> cancelItem', async () => {
        let creatorBalanceBefore = await web3.eth.getBalance(creator)

        let registryBalanceBefore = await web3.eth.getBalance(itemRegistryInstance.address)
        assert.equal(registryBalanceBefore, reward)

        // call cancelItem
        await itemRegistryInstance.cancelItem(itemId, { from: creator })

        let itemStatus = (await itemRegistryInstance.getItem(itemId)).itemStatus
        assert.equal(itemStatus, 5)

        let creatorBalanceAfter = await web3.eth.getBalance(creator)

        let registryBalanceAfter = await web3.eth.getBalance(itemRegistryInstance.address)
        assert.equal(registryBalanceAfter, 0)

        let targetBalance = web3.utils.toBN(creatorBalanceBefore).add(web3.utils.toBN(reward))

        // assert cretor's account has received refund
        // @dev NB note - this does not account for gas and will fail occasionally
        assert.equal(
            parseFloat(web3.utils.fromWei(creatorBalanceAfter, 'ether')).toFixed(1),
            parseFloat(web3.utils.fromWei(targetBalance, 'ether')).toFixed(1)
        )
    })
})