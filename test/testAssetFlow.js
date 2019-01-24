const LAFAssetRegistry = artifacts.require("./LAFAssetRegistry.sol")
const LAFAssetStorage = artifacts.require("./LAFAssetStorage.sol")

getAddressEtherBalanceFloat = async (address) => {
    return parseFloat(web3.utils.fromWei(await web3.eth.getBalance(address), 'ether'))
}

// Tests are mainly of a functional nature, testing corefunctionality of creating an asset and taking it through its various statuses

contract("LAFAssetRegistry (Asset Flows)", accounts => {
    var contractsOwner = accounts[0]
    var creator = accounts[1]
    var matcher = accounts[2]

    var assetRegistryInstance
    var assetStorageInstance
    var assetId

    var reward

    // deploy new instances of the contract(s); create a new asset
    beforeEach(async function () {
        // 1st time system setup...

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
    })

    // ideal asset flow round-trip
    // assert withdrawl amounts
    it('...newLostAsset -> potentialMatch -> matchConfirmed -> assetRecovered -> withdrawl', async () => {
        let assetStatus = (await assetRegistryInstance.getAsset(assetId)).assetStatus
        assert.equal(assetStatus, 1)

        // call potentialMatch
        await assetRegistryInstance.foundLostAsset(
            assetId,
            "Details of where what etc",
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,32,
            { from: matcher })

        assetStatus = (await assetRegistryInstance.getAsset(assetId)).assetStatus
        assert.equal(assetStatus, 2)
        
        // call matchConfirmed
        await assetRegistryInstance.matchConfirmed(assetId, "", { from: creator })

        assetStatus = (await assetRegistryInstance.getAsset(assetId)).assetStatus
        assert.equal(assetStatus, 3)

        // call assetRecovered
        await assetRegistryInstance.assetRecovered(assetId, { from: creator })

        assetStatus = (await assetRegistryInstance.getAsset(assetId)).assetStatus
        assert.equal(assetStatus, 4)

        // test assert the account's claimable reward matches the initial asset reward >>> 
        let claimableReward = await assetRegistryInstance.getClaimableRewards({ from: matcher })

        assert.equal(claimableReward, reward, 'Claimable reward for matcher shoud be initial reward amount')
        // <<<

        // test withdrawl >>>
        let matcherBalanceBeforeWithdrawl = await web3.eth.getBalance(matcher)

        // withdraw reward as matcher
        await assetRegistryInstance.withdrawRewards({ from: matcher })

        claimableReward = await assetRegistryInstance.getClaimableRewards({ from: matcher })

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

    // asset recovery failure flow
    // assert asset status reset
    it('...newLostAsset -> potentialMatch -> matchConfirmed -> assetRecoveryFailed', async () => {
        // call foundLostAsset
        await assetRegistryInstance.foundLostAsset(
            assetId,
            "Details of finding items",
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,
            32,
            { from: matcher })
       
        // call matchConfirmed
        await assetRegistryInstance.matchConfirmed(assetId, "", { from: creator })

        // call assetRecovered
        await assetRegistryInstance.assetRecoveryFailed(assetId, { from: creator })

        let assetStatus = (await assetRegistryInstance.getAsset(assetId)).assetStatus
        assert.equal(assetStatus, 1)
    })

    // match invalid flow
    // assert asset status reset
    it('...newLostAsset -> potentialMatch -> matchInvalid', async () => {
        // call foundLostAsset
        await assetRegistryInstance.foundLostAsset(
            assetId,
            "Details of finding items",
            "0x39a8cb1d77c213889e8a638394c9a5190d1fa703ebb02e23a091a99566dd8ccf",
            18,
            32,
            { from: matcher })

         // call matchInvalid
         await assetRegistryInstance.matchInvalid(assetId, { from: creator })

         let assetStatus = (await assetRegistryInstance.getAsset(assetId)).assetStatus
         assert.equal(assetStatus, 1)
    })

    // cancel asset flow
    // assert refund to creator & asset cancel state
    it('...newLostAsset -> cancelAsset', async () => {
        let creatorBalanceBefore = await web3.eth.getBalance(creator)

        let registryBalanceBefore = await web3.eth.getBalance(assetRegistryInstance.address)
        assert.equal(registryBalanceBefore, reward)

        // call cancelAsset
        await assetRegistryInstance.cancelAsset(assetId, { from: creator })

        let assetStatus = (await assetRegistryInstance.getAsset(assetId)).assetStatus
        assert.equal(assetStatus, 5)

        let creatorBalanceAfter = await web3.eth.getBalance(creator)

        let registryBalanceAfter = await web3.eth.getBalance(assetRegistryInstance.address)
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