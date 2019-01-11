const LAFAssetRegistry = artifacts.require("./LAFAssetRegistry.sol")
const LAFAssetStorage = artifacts.require("./LAFAssetStorage.sol")

contract("LAFAssetRegistry (Asset Flows)", accounts => {
    var assetRegistryInstance
    var assetStorageInstance

    beforeEach(async function () {
        // 1st time system setup...

        // 1. deploy new contract intstances
        assetRegistryInstance = await LAFAssetRegistry.new({ from: accounts[0] })
        assetStorageInstance = await LAFAssetStorage.new({ from: accounts[0] })

        // 2. set storage address
        await assetRegistryInstance.setAssetStorageAddress(assetStorageInstance.address, { from: accounts[0] })

        // 3. set registry as allowed sender on storage
        await assetStorageInstance.addAllowedSender(assetRegistryInstance.address, { from: accounts[0] })

        // 4. enable registry
        await assetRegistryInstance.unpause()
    })

    it('...create -> potentialMatch -> matchConfirmed -> assetRecovered', async () => {
        let titleStr = "Asset Title Placeholder"
        let descriptionStr = "This is some rando placeholder content added during testing"
        let countryIso = "CAN"
        let stateProvince = "NS"
        let city = "Halifax"

        let rewardStr = web3.utils.toWei("1.2345", 'ether').toString()

        // create new asset
        let { logs } =  await assetRegistryInstance.newLostAsset(
            titleStr,
            // descriptionStr,
            web3.utils.asciiToHex(countryIso),
            web3.utils.asciiToHex(stateProvince),
            web3.utils.asciiToHex(city),
            { from: accounts[1], value: rewardStr }
        )
        
        let { assetId } = logs.find(x => x.event === 'AssetStored').args;
        console.log(assetId.toString())

        // call potentialMatch
        await assetRegistryInstance.potentialMatch(assetId, { from: accounts[2] })
        
        // call matchConfirmed
        await assetRegistryInstance.matchConfirmed(assetId, "", { from: accounts[1] })

        // call assetRecovered
        await assetRegistryInstance.assetRecovered(assetId, { from: accounts[1] })
    })
})