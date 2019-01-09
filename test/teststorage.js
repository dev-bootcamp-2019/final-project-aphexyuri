const truffleAssert = require('truffle-assertions')

const LAFAssetStorage = artifacts.require('./LAFAssetStorage.sol')

contract('LAFAssetStorage', accounts => {
    var assetStorageInstance

    before(async function () {
        assetStorageInstance = await LAFAssetStorage.new({ from: accounts[0] })

        // console.log('accounts[0]', accounts[0])
        // console.log('accounts[1]', accounts[1])
    })

    it('...owner is accounts[0]', async () => {
        let owner = await assetStorageInstance.owner()
        assert.equal(owner, accounts[0])
    })

    it('...set and verify allowedSender', async () => {
        await assetStorageInstance.setAllowedSender(accounts[1], { from: accounts[0] })

        let allowedSender = await assetStorageInstance.allowedSender()
        assert.equal(allowedSender, accounts[1])
    })

    it('...uint256 uninitialized value default to zero', async () => {
        let unsetUint256 = await assetStorageInstance.uintStorage(web3.utils.keccak256('unsetval_key'))
        assert.equal(unsetUint256, 0)
    })

    it('...storeUint256 fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeUint256(web3.utils.keccak256('uint256_key_owner_sender_test'), 99, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })
    
    it('...storedString fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeString(web3.utils.keccak256('string_key_owner_sender_test'), 'Hello storage', { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it('...storeAddress fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeAddress(web3.utils.keccak256('address_key_owner_sender_test'), accounts[7], { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it('...storeBytes fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeBytes(web3.utils.keccak256('bytes_key_owner_sender_test'), web3.utils.hexToBytes(web3.utils.toHex('Byte me!')), { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it('...storeBool fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeBool(web3.utils.keccak256('bool_key_owner_sender_test'), false, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it('...storeInt256 fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            assetStorageInstance.storeInt256(web3.utils.keccak256('int256_key_owner_sender_test'), -99, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    it('...5x uint256 write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await assetStorageInstance.storeUint256(web3.utils.keccak256('uint256_key_' + i), i, { from: accounts[1] })
            let storedUint256 = await assetStorageInstance.uintStorage(web3.utils.keccak256('uint256_key_' + i))
            assert.equal(storedUint256, i)
        }
    })

    it('...5x string write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await assetStorageInstance.storeString(web3.utils.keccak256('string_key_' + i), 'String Val ' + i, { from: accounts[1] })
            let storedString = await assetStorageInstance.stringStorage(web3.utils.keccak256('string_key_' + i))
            assert.equal(storedString, 'String Val ' + i)    
        }
    })

    it('...5x address write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await assetStorageInstance.storeAddress(web3.utils.keccak256('address_key_' + i), accounts[i], { from: accounts[1] })
            let storedAddress = await assetStorageInstance.addressStorage(web3.utils.keccak256('address_key_' + i))
            assert.equal(storedAddress, accounts[i])    
        }
    })

    it('...5x bytes write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            let stringVal = 'Byte me - ' + i
            let hexVal = web3.utils.toHex(stringVal)
            let bytesVal = web3.utils.hexToBytes(hexVal)

            await assetStorageInstance.storeBytes(web3.utils.keccak256('bytes_key_' + i), bytesVal, { from: accounts[1] })
            let storedBytes = await assetStorageInstance.bytesStorage(web3.utils.keccak256('bytes_key_' + i))
            assert.equal(web3.utils.hexToAscii(storedBytes), stringVal)    
        }
    })

    it('...5x bool write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await assetStorageInstance.storeBool(web3.utils.keccak256('bool_key_' + i), true, { from: accounts[1] })
            let storedBool = await assetStorageInstance.boolStorage(web3.utils.keccak256('bool_key_' + i))
            assert.equal(storedBool, true)    
        }
    })

    it('...5x ingt256 write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await assetStorageInstance.storeInt256(web3.utils.keccak256('int256_key_' + i), i - 1000, { from: accounts[1] })
            let storedInt256 = await assetStorageInstance.intStorage(web3.utils.keccak256('int256_key_' + i))
            assert.equal(storedInt256, i - 1000)    
        }
    })
})