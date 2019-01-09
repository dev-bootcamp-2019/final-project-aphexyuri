const truffleAssert = require('truffle-assertions')
const LAFAssetStorage = artifacts.require('./LAFAssetStorage.sol')

contract("LAFAssetStorage", accounts => {
    var assetStorageInstance

    before(async function () {
        assetStorageInstance = await LAFAssetStorage.new({ from: accounts[0] })

        // console.log('accounts[0]', accounts[0])
        // console.log('accounts[1]', accounts[1])

        await assetStorageInstance.setAllowedSender(accounts[1], { from: accounts[0] })
        let allowedSender = await assetStorageInstance.allowedSender()
        // console.log('allowedSender', allowedSender)
    })

    it("...storeUint256 fails if not from owner or allowedSender", async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeUint256(web3.utils.keccak256("uint256_key_owner_sender_test"), 99, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })
    
    it("...storedString fails if not from owner or allowedSender", async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeString(web3.utils.keccak256("string_key_owner_sender_test"), "Hello storage", { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it("...storeAddress fails if not from owner or allowedSender", async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeAddress(web3.utils.keccak256("address_key_owner_sender_test"), accounts[7], { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it("...storeBytes if not from owner or allowedSender", async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeBytes(web3.utils.keccak256("bytes_key_owner_sender_test"), web3.utils.hexToBytes(web3.utils.toHex("Byte me!")), { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it("...storeBool if not from owner or allowedSender", async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeBool(web3.utils.keccak256("bool_key_owner_sender_test"), false, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it("...storeInt256 if not from owner or allowedSender", async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeInt256(web3.utils.keccak256("int256_key_owner_sender_test"), -99, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
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