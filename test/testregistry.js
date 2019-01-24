const truffleAssert = require('truffle-assertions')

const LAFAssetRegistry = artifacts.require("./LAFAssetRegistry.sol")
const LAFAssetStorage = artifacts.require("./LAFAssetStorage.sol")

const delay = ms => new Promise(res => setTimeout(res, ms));

addAssetHelperNoAwait = async (assetRegistryInstance, title, description, countryIso, stateProvince, city, account) => {
    await assetRegistryInstance.newLostAsset(
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

// tests for core gegistry functionality such as state & ownership emodifiers across asset statuses

contract("LAFAssetRegistry", accounts => {
    var assetRegistryInstance
    var assetStorageInstance

    let reward = "1.2345"

    before(async function () {
        assetRegistryInstance = await LAFAssetRegistry.new({ from: accounts[0] })
        assetStorageInstance = await LAFAssetStorage.new({ from: accounts[0] })
    })

    // test that registry ownere is account zero
    it('...owner is accounts[0]', async () => {
        let owner = await assetRegistryInstance.owner()
        assert.equal(owner, accounts[0])
    })
    
    // set the registry contract address as allowed sender in storage contract and verify
    it("...set allowed sender in storage addresses & verify", async () => {
        await assetStorageInstance.addAllowedSender(assetRegistryInstance.address, { from: accounts[0] })
        let isAllowedSender = await assetStorageInstance.senderIsAllowed(assetRegistryInstance.address)
        assert.ok(isAllowedSender)
    })

    // set the storage contract address in the registry and verify
    it("...set storage addresses & verify", async () => {
        await assetRegistryInstance.setAssetStorageAddress(assetStorageInstance.address, { from: accounts[0] })
        let storageAddress = await assetRegistryInstance.getAssetStorageAddress()
        assert.equal(storageAddress, assetStorageInstance.address)
    })

    // by default, new registries should be paused as defined in the LAFREegistryBase base class class's constructor
    it("...new registry is paused", async () => {
        assert.ok(await assetRegistryInstance.paused())
    })

    // iunpause registry and verify
    it("...enable registry & verify", async () => {
        await assetRegistryInstance.unpause( { from: accounts[0] } )
        assert.ok(!await assetRegistryInstance.paused())
    })

    // add a new asset read from chain to verify write/read
    // assert balances of contract has addition of reward sent with creation of new asset
    it("...add asset, retrieve + verify fields, check stakeholder balances", async () => {
        let titleStr = "Asset Title Placeholder"
        let descriptionStr = "This is some rando placeholder content added during testing"
        let countryIso = "CAN"
        let stateProvince = "NS"
        let city = "Halifax"

        let contractBalanceBefore = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(assetRegistryInstance.address), 'ether'))

        // let { logs } = await addAssetHelper(assetRegistryInstance, titleStr, descriptionStr, countryIso, stateProvince, city, accounts[0])

        let rewardStr = web3.utils.toWei(reward, 'ether').toString()

        let { logs } =  await assetRegistryInstance.newLostAsset(
            titleStr,
            descriptionStr,
            web3.utils.asciiToHex(countryIso),
            web3.utils.asciiToHex(stateProvince),
            web3.utils.asciiToHex(city),
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,
            32,
            { from: accounts[1], value: rewardStr }
        )
        
        // get assetId from added item's logs
        let { assetId } = logs.find(x => x.event === 'AssetStored').args;

        let retrievedAsset = await assetRegistryInstance.getAsset(assetId);
        
        assert.equal(assetId, 0)
        assert.equal(retrievedAsset.assetTitle, titleStr)
        assert.equal(web3.utils.hexToUtf8(retrievedAsset.isoCountryCode), countryIso)
        assert.equal(web3.utils.hexToUtf8(retrievedAsset.stateProvince), stateProvince)
        assert.equal(web3.utils.fromWei(retrievedAsset.reward, 'ether'), 1.2345)

        // // check contract balance
        let rewardEth = parseFloat(web3.utils.fromWei(retrievedAsset.reward))
        let contractBalanceAfter = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(assetRegistryInstance.address), 'ether'))
        assert.equal(contractBalanceAfter, rewardEth + contractBalanceBefore)
    })

    // verify state modifier restriction in matchConfirmed call
    it("...calling matchConfirmed on asset with status AssetStatus.Posted fails", async () => {
        await truffleAssert.fails(
            assetRegistryInstance.matchConfirmed(0, "Starbuck on corner of 43rd and 6th. April 1, 2019", { from: accounts[1] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // verify state modifier restriction in matchInvalid call
    it("...calling matchInvalid on asset with status AssetStatus.Posted fails", async () => {
        await truffleAssert.fails(
            assetRegistryInstance.matchInvalid(0, { from: accounts[1] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // test that non-asset creators can't call matchConfirmed on an asset they do not own
    it("...calling matchConfirmed as non-asset creator fails", async () => {
        // first call potentialMatch on asset to get it to AssetStatus.PotentialMatch status
        await assetRegistryInstance.foundLostAsset(
            0,
            "Details of finding items",
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,
            32,
            { from: accounts[2]} )

        await truffleAssert.fails(
            assetRegistryInstance.matchConfirmed(0, "Starbucks on corner on Noth and South April 1, 2019", { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // now, test that asset creator can call matchConfirmed
    it("...calling matchConfirmed as asset creator succeeds", async () => {
        let retrievedAsset = await assetRegistryInstance.getAsset(0);

        await assetRegistryInstance.matchConfirmed(0, "Starbucks on corner on Noth and South April 1, 2019", { from: retrievedAsset.creator })
        assert.ok(true)
    })

    // test that non-asset creators can't call assetRecovered on an asset they do not own
    it("...calling assetRecovered as non-asset creator fails", async () => {
        await truffleAssert.fails(
            assetRegistryInstance.assetRecovered(0, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // now, test that asset creator can call assetRecovered
    it("...calling assetRecovered as asset creator succeeds", async () => {
        let retrievedAsset = await assetRegistryInstance.getAsset(0);
        await assetRegistryInstance.assetRecovered(0, { from: retrievedAsset.creator })
        assert.ok(true)
    })


    it("...check claimable rewards", async () => {
        let ass3claimableRewards = await assetRegistryInstance.getClaimableRewards({ from: accounts[3] })
        assert.equal(ass3claimableRewards, 0)

        let claimableRewards = await assetRegistryInstance.getClaimableRewards({ from: accounts[2] })
        assert.equal(web3.utils.fromWei(claimableRewards, 'ether').toString(), reward)
    })

    // TODO do bulk add, then verify count as well as no duplicates asset IDs etc (will likely require new depolyment?)
    // it("...bulk asset add - verify assetIds", async () => {
    //     for(let i = 1; i <= 50; i++) {
    //         await addAssetHelperNoAwait(assetRegistryInstance, 'Title_' + i, 'Description_' + i, 'CAD', 'SP', 'City_' + i, accounts[0])
    //     }

    //     console.log('waiting 5 seconds...')

    //     await delay(5000);

    //     for(let j = 1; j <= 50; j++) {
    //         let retrievedAsset = await assetRegistryInstance.getAsset(j);
    //         console.log('retrievedAsset.title', retrievedAsset.title + ", " + j)
    //         assert.equal(retrievedAsset.title, 'Title_' + j-1)
    //         // addAssetHelperNoAwait(assetRegistryInstance, 'Title_' + j, 'Description_' + j, 'CAD', 'ON', 'City_' + j, accounts[0])
    //     }
    // })

    //TODO - lots more testing for asset flow and permissions along the way
})
