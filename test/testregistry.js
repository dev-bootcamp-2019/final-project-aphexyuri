const LAFAssetRegistry = artifacts.require("./LAFAssetRegistry.sol")
const LAFAssetStorage = artifacts.require("./LAFAssetStorage.sol")

addAssetHelperNoAwait = async (assetRegistryInstance, title, description, countryIso, stateProvince, city, account) => {
    assetRegistryInstance.newLostAsset(
        title,
        description,
        web3.utils.asciiToHex(countryIso),
        web3.utils.asciiToHex(stateProvince),
        web3.utils.asciiToHex(city),
        { from: account }
    )
}

contract("LAFAssetRegistry", accounts => {
    let assetRegistryInstance
    let assetStorageInstance

    before(async function () {
        assetRegistryInstance = await LAFAssetRegistry.new({ from: accounts[0] })
        assetStorageInstance = await LAFAssetStorage.new({ from: accounts[0] })

        // console.log('assetRegistryInstance.address', assetRegistryInstance.address)
        // console.log('assetStorageInstance.address', assetStorageInstance.address)

        assetRegistryInstance.enableRegistry()
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

    // it("..set initial assset count", async () => {
    //     await assetRegistryInstance.setInitialAssetCount( { from: accounts[0] } )
    //     assert.ok(true)
    // })

    it("...add asset, retrieve & verify fields", async () => {
        let titleStr = "Asset Title Placeholder"
        let descriptionStr = "This is some rando placeholder content added during testing"
        let countryIso = "CAN"
        let stateProvince = "NS"
        let city = "Halifax"

        // let { logs } = await addAssetHelper(assetRegistryInstance, titleStr, descriptionStr, countryIso, stateProvince, city, accounts[0])

        let { logs } =  await assetRegistryInstance.newLostAsset(
            titleStr,
            descriptionStr,
            web3.utils.asciiToHex(countryIso),
            web3.utils.asciiToHex(stateProvince),
            web3.utils.asciiToHex(city),
            { from: accounts[0] }
        )
        
        // get assetId from added item's logs
        let { assetId } = logs.find(x => x.event === 'AssetStored').args;
        console.log(assetId.toString())

        let retrievedAsset = await assetRegistryInstance.getAsset(assetId);
        // console.log(retrievedAsset)
        
        assert.equal(assetId, 0)
        assert.equal(retrievedAsset.title, titleStr)
        assert.equal(retrievedAsset.description, descriptionStr)
        assert.equal(web3.utils.hexToAscii(retrievedAsset.isoCountryCode), countryIso)
        assert.equal(web3.utils.hexToAscii(retrievedAsset.stateProvince), stateProvince)
        assert.equal(web3.utils.hexToAscii(retrievedAsset.city), city)
    })
})