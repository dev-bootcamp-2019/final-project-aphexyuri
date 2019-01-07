const LAFAssetRegistry = artifacts.require("./LAFAssetRegistry.sol")
const LAFAssetStorage = artifacts.require("./LAFAssetStorage.sol")

addAssetHelper = async (assetRegistryInstance, title, description, countryIso, stateProvince, city, account) => {
    return await assetRegistryInstance.newLostAsset(
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

        assetRegistryInstance.enableRegistry()
    })
    
    it("...registry addresses set", async () => {
        await assetStorageInstance.setAssetRegistryAddress(assetRegistryInstance.address, { from: accounts[0] })
        let registryAddress = await assetStorageInstance.registryAddress()
        assert.equal(registryAddress, assetRegistryInstance.address)
    })

    it("...storage addresses set", async () => {
        await assetRegistryInstance.setAssetStorageAddress(assetStorageInstance.address, { from: accounts[0] })
        let storageAddress = await assetRegistryInstance.storageAddress()
        assert.equal(storageAddress, assetStorageInstance.address)
    })

    it("...registry enabled", async () => {
        assetRegistryInstance.enableRegistry()
        assert.ok(assetRegistryInstance._registryEnabled())
    })

    it("...add asset, retrieve and check fields", async () => {
        let titleStr = "Asset Title Placeholder"
        let descriptionStr = "This is some rando placeholder content added during testing"
        let countryIso = "CAN"
        let stateProvince = "NS"
        let city = "Halifax"

        let { logs } = await addAssetHelper(assetRegistryInstance, titleStr, descriptionStr, countryIso, stateProvince, city, accounts[0])
        
        // get assetId from added item's logs
        let { assetId } = logs.find(x => x.event === 'AssetStored').args;

        let retrievedAsset = await assetRegistryInstance.getAsset(assetId);

        // console.log(retrievedAsset)

        assert.equal(retrievedAsset.title, titleStr)
        assert.equal(retrievedAsset.description, descriptionStr)
        assert.equal(web3.utils.hexToAscii(retrievedAsset.isoCountryCode), countryIso)
        assert.equal(web3.utils.hexToAscii(retrievedAsset.stateProvince), stateProvince)
        assert.equal(web3.utils.hexToAscii(retrievedAsset.city), city)
    })
})