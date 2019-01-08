const LAFAssetStorage = artifacts.require("./LAFAssetStorage.sol")

contract("LAFAssetStorage", accounts => {
    var assetStorageInstance

    before(async function () {
        assetStorageInstance = await LAFAssetStorage.new({ from: accounts[0] })

        // console.log('accounts[0]', accounts[0])

        await assetStorageInstance.setAllowedSender(accounts[1], { from: accounts[0] })
        let allowedSender = await assetStorageInstance.allowedSender()
        // console.log('allowedSender (accounts[1])', allowedSender)
    })

    it("...uint256 write/read verifies (10x)", async () => {
        for(let i = 0; i < 10; i++) {
            await assetStorageInstance.storeUint256(web3.utils.keccak256("uint256_key_" + i), i, { from: accounts[1] })
            let storedUint256 = await assetStorageInstance.uintStorage(web3.utils.keccak256("uint256_key_" + i))
            assert.equal(storedUint256, i)
        }
    })

    it("...string write/read verifies (10x)", async () => {
        for(let i = 0; i < 10; i++) {
            await assetStorageInstance.storeString(web3.utils.keccak256("string_key_" + i), "String Val " + i, { from: accounts[1] })
            let storedString = await assetStorageInstance.stringStorage(web3.utils.keccak256("string_key_" + i))
            assert.equal(storedString, "String Val " + i)    
        }
    })
})