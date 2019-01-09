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
        { from: account }
    )
}

contract("LAFAssetRegistry", accounts => {
    var assetRegistryInstance
    var assetStorageInstance

    before(async function () {
        assetRegistryInstance = await LAFAssetRegistry.new({ from: accounts[0] })
        assetStorageInstance = await LAFAssetStorage.new({ from: accounts[0] })

        // console.log('assetRegistryInstance.address', assetRegistryInstance.address)
        // console.log('assetStorageInstance.address', assetStorageInstance.address)
    })
    
    it("...set allowed sender in storage addresses & verify", async () => {
        await assetStorageInstance.setAllowedSender(assetRegistryInstance.address, { from: accounts[0] })
        let allowedSender = await assetStorageInstance.allowedSender()
        assert.equal(allowedSender, assetRegistryInstance.address)
    })

    it("...set storage addresses & verify", async () => {
        await assetRegistryInstance.setAssetStorageAddress(assetStorageInstance.address, { from: accounts[0] })
        let storageAddress = await assetRegistryInstance.getAssetStorageAddress()
        assert.equal(storageAddress, assetStorageInstance.address)
    })

    it("...enable registry & verify", async () => {
        assetRegistryInstance.enableRegistry( { from: accounts[0] } )
        assert.ok(assetRegistryInstance._registryEnabled())
    })

    it("...add asset, retrieve & verify fields", async () => {
        let titleStr = "Asset Title Placeholder"
        let descriptionStr = "This is some rando placeholder content added during testing"
        let countryIso = "CAN"
        let stateProvince = "NS"
        let city = "Halifax"

        // let { logs } = await addAssetHelper(assetRegistryInstance, titleStr, descriptionStr, countryIso, stateProvince, city, accounts[0])

        let rewardStr = web3.utils.toWei("1.2345", 'ether').toString()

        let { logs } =  await assetRegistryInstance.newLostAsset(
            titleStr,
            descriptionStr,
            web3.utils.asciiToHex(countryIso),
            web3.utils.asciiToHex(stateProvince),
            web3.utils.asciiToHex(city),
            { from: accounts[1], value: rewardStr }
        )
        
        // get assetId from added item's logs
        let { assetId } = logs.find(x => x.event === 'AssetStored').args;
        // console.log(assetId.toString())

        let retrievedAsset = await assetRegistryInstance.getAsset(assetId);
        // console.log(retrievedAsset)
        
        assert.equal(assetId, 0)
        assert.equal(retrievedAsset.title, titleStr)
        assert.equal(retrievedAsset.description, descriptionStr)
        assert.equal(web3.utils.hexToAscii(retrievedAsset.isoCountryCode), countryIso)
        assert.equal(web3.utils.hexToAscii(retrievedAsset.stateProvince), stateProvince)
        assert.equal(web3.utils.hexToAscii(retrievedAsset.city), city)
        assert.equal(web3.utils.fromWei(retrievedAsset.reward, 'ether'), 1.2345)
    })

    it("...calling matchConfirmed on item with status AssetStatus.Posted item fails", async () => {
        await truffleAssert.fails(
            assetRegistryInstance.matchConfirmed(0, "Starbuck on corner of 43rd and 6th. April 1, 2019", { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it("...calling matchConfirmed as non-asset creator fails", async () => {
        // first call potentialMatch on item to get it to AssetStatus.PotentialMatch status
        await assetRegistryInstance.potentialMatch(0, { from: accounts[2]} )

        await truffleAssert.fails(
            assetRegistryInstance.matchConfirmed(0, "Starbuck on corner on Noth and South April 1, 2019", { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it("...calling matchConfirmed as asset creator succeeds", async () => {
        let retrievedAsset = await assetRegistryInstance.getAsset(0);
        await assetRegistryInstance.matchConfirmed(0, "Starbuck on corner on Noth and South April 1, 2019", { from: retrievedAsset.creator })
        assert.ok(true)
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
})
