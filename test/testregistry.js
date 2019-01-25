const truffleAssert = require('truffle-assertions')

const LAFItemRegistry = artifacts.require("./LAFItemRegistry.sol")
const LAFItemStorage = artifacts.require("./LAFItemStorage.sol")

const delay = ms => new Promise(res => setTimeout(res, ms));

addItemHelperNoAwait = async (itemRegistryInstance, title, description, countryIso, stateProvince, city, account) => {
    await itemRegistryInstance.newLostItem(
        title,
        description,
        web3.utils.asciiToHex(countryIso),
        web3.utils.asciiToHex(stateProvince),
        web3.utils.asciiToHex(city),
        "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
        18,
        32,
        { from: account }
    )
}

// tests for core gegistry functionality such as state & ownership emodifiers across item statuses

contract("LAFItemRegistry", accounts => {
    var itemRegistryInstance
    var itemStorageInstance

    var creator = accounts[1]
    var matcher = accounts[2]

    let reward = "1.2345"

    before(async function () {
        itemRegistryInstance = await LAFItemRegistry.new({ from: accounts[0] })
        itemStorageInstance = await LAFItemStorage.new({ from: accounts[0] })
    })

    // test that registry ownere is account zero
    it('...owner is accounts[0]', async () => {
        let owner = await itemRegistryInstance.owner()
        assert.equal(owner, accounts[0])
    })
    
    // set the registry contract address as allowed sender in storage contract and verify
    it("...set allowed sender in storage addresses & verify", async () => {
        await itemStorageInstance.addAllowedSender(itemRegistryInstance.address, { from: accounts[0] })
        let isAllowedSender = await itemStorageInstance.senderIsAllowed(itemRegistryInstance.address)
        assert.ok(isAllowedSender)
    })

    // set the storage contract address in the registry and verify
    it("...set storage addresses & verify", async () => {
        await itemRegistryInstance.setItemStorageAddress(itemStorageInstance.address, { from: accounts[0] })
        let storageAddress = await itemRegistryInstance.getItemStorageAddress()
        assert.equal(storageAddress, itemStorageInstance.address)
    })

    // by default, new registries should be paused as defined in the LAFREegistryBase base class class's constructor
    it("...new registry is paused", async () => {
        assert.ok(await itemRegistryInstance.paused())
    })

    // iunpause registry and verify
    it("...enable registry & verify", async () => {
        await itemRegistryInstance.unpause( { from: accounts[0] } )
        assert.ok(!await itemRegistryInstance.paused())
    })

    // add a new item read from chain to verify write/read
    // assert balances of contract has addition of reward sent with creation of new item
    it("...add item, retrieve + verify fields, check stakeholder balances", async () => {
        let titleStr = "Item Title Placeholder"
        let descriptionStr = "This is some rando placeholder content added during testing"
        let countryIso = "CAN"
        let stateProvince = "NS"
        let city = "Halifax"

        let contractBalanceBefore = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(itemRegistryInstance.address), 'ether'))

        // let { logs } = await addItemHelper(itemRegistryInstance, titleStr, descriptionStr, countryIso, stateProvince, city, accounts[0])

        let rewardStr = web3.utils.toWei(reward, 'ether').toString()

        let { logs } =  await itemRegistryInstance.newLostItem(
            titleStr,
            descriptionStr,
            web3.utils.asciiToHex(countryIso),
            web3.utils.asciiToHex(stateProvince),
            web3.utils.asciiToHex(city),
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,
            32,
            { from: creator, value: rewardStr }
        )
        
        // get itemId from added item's logs
        let { itemId } = logs.find(x => x.event === 'ItemStored').args;

        let retrievedItem = await itemRegistryInstance.getItem(itemId);
        
        assert.equal(itemId, 0)
        assert.equal(retrievedItem.itemTitle, titleStr)
        assert.equal(web3.utils.hexToUtf8(retrievedItem.isoCountryCode), countryIso)
        assert.equal(web3.utils.hexToUtf8(retrievedItem.stateProvince), stateProvince)
        assert.equal(web3.utils.fromWei(retrievedItem.reward, 'ether'), 1.2345)

        // // check contract balance
        let rewardEth = parseFloat(web3.utils.fromWei(retrievedItem.reward))
        let contractBalanceAfter = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(itemRegistryInstance.address), 'ether'))
        assert.equal(contractBalanceAfter, rewardEth + contractBalanceBefore)
    })

    // verify state modifier restriction in matchConfirmed call
    it("...calling matchConfirmed on item with status ItemStatus.Posted fails", async () => {
        await truffleAssert.fails(
            itemRegistryInstance.matchConfirmed(0, "Starbuck on corner of 43rd and 6th. April 1, 2019", { from: creator }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // verify state modifier restriction in matchInvalid call
    it("...calling matchInvalid on item with status ItemStatus.Posted fails", async () => {
        await truffleAssert.fails(
            itemRegistryInstance.matchInvalid(0, { from: creator }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // test that non-item creators can't call matchConfirmed on an item they do not own
    it("...calling matchConfirmed as non-item creator fails", async () => {
        // first call potentialMatch on item to get it to ItemStatus.PotentialMatch status
        await itemRegistryInstance.foundLostItem(
            0,
            "Details of finding items",
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,
            32,
            { from: matcher} )

        await truffleAssert.fails(
            itemRegistryInstance.matchConfirmed(0, "Starbucks on corner on Noth and South April 1, 2019", { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // now, test that item creator can call matchConfirmed
    it("...calling matchConfirmed as item creator succeeds", async () => {
        let retrievedItem = await itemRegistryInstance.getItem(0);

        await itemRegistryInstance.matchConfirmed(0, "Starbucks on corner on Noth and South April 1, 2019", { from: retrievedItem.creator })
        assert.ok(true)
    })

    // test that non-item creators can't call itemRecovered on an item they do not own
    it("...calling itemRecovered as non-item creator fails", async () => {
        await truffleAssert.fails(
            itemRegistryInstance.itemRecovered(0, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // now, test that item creator can call itemRecovered
    it("...calling itemRecovered as item creator succeeds", async () => {
        let retrievedItem = await itemRegistryInstance.getItem(0);
        await itemRegistryInstance.itemRecovered(0, { from: retrievedItem.creator })
        assert.ok(true)
    })


    it("...check claimable rewards", async () => {
        let ass3claimableRewards = await itemRegistryInstance.getClaimableRewards({ from: accounts[3] })
        assert.equal(ass3claimableRewards, 0)

        let claimableRewards = await itemRegistryInstance.getClaimableRewards({ from: matcher })
        assert.equal(web3.utils.fromWei(claimableRewards, 'ether').toString(), reward)
    })

    // TODO do bulk add, then verify count as well as no duplicates item IDs etc (will likely require new depolyment?)
    // it("...bulk item add - verify itemIds", async () => {
    //     for(let i = 1; i <= 50; i++) {
    //         await addItemHelperNoAwait(itemRegistryInstance, 'Title_' + i, 'Description_' + i, 'CAD', 'SP', 'City_' + i, accounts[0])
    //     }

    //     console.log('waiting 5 seconds...')

    //     await delay(5000);

    //     for(let j = 1; j <= 50; j++) {
    //         let retrievedItem = await itemRegistryInstance.getItem(j);
    //         console.log('retrievedItem.title', retrievedItem.title + ", " + j)
    //         assert.equal(retrievedItem.title, 'Title_' + j-1)
    //         // addItemHelperNoAwait(itemRegistryInstance, 'Title_' + j, 'Description_' + j, 'CAD', 'ON', 'City_' + j, accounts[0])
    //     }
    // })

    //TODO - lots more testing for item flow and permissions along the way
})
