const truffleAssert = require('truffle-assertions')

const LAFItemStorage = artifacts.require('./LAFItemStorage.sol')

// tests key storage mechanisms of storage contract
contract('LAFItemStorage', accounts => {
    var itemStorageInstance

    before(async function () {
        itemStorageInstance = await LAFItemStorage.new({ from: accounts[0] })
    })

    // test for owner
    it('...owner is accounts[0]', async () => {
        let owner = await itemStorageInstance.owner()
        assert.equal(owner, accounts[0])
    })

    // test for allowed sender on whitelist
    it('...set and verify allowed sender', async () => {
        // account[1]
        await itemStorageInstance.addAllowedSender(accounts[1], { from: accounts[0] })

        let senderAllowedAcc1 = await itemStorageInstance.senderIsAllowed(accounts[1])
        assert.ok(senderAllowedAcc1)

        // account[7]
        await itemStorageInstance.addAllowedSender(accounts[7], { from: accounts[0] })

        let senderAllowedAcc7 = await itemStorageInstance.senderIsAllowed(accounts[7])
        assert.ok(senderAllowedAcc7)
    })

    // test unset key defaults to zero (counter mechanism)
    it('...uint256 uninitialized value default to zero', async () => {
        let unsetUint256 = await itemStorageInstance.uint256Storage(web3.utils.keccak256('unsetval_key'))
        assert.equal(unsetUint256, 0)
    })

    // test storage from only whitelist sender
    it('...storeUint256 fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            itemStorageInstance.storeUint256(web3.utils.keccak256('uint256_key_owner_sender_test'), 99, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })
    
    // test storage from only whitelist sender
    it('...storedString fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            itemStorageInstance.storeString(web3.utils.keccak256('string_key_owner_sender_test'), 'Hello storage', { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // test storage from only whitelist sender
    it('...storeAddress fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            itemStorageInstance.storeAddress(web3.utils.keccak256('address_key_owner_sender_test'), accounts[7], { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // test storage from only whitelist sender
    it('...storeBytes fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            itemStorageInstance.storeBytes(web3.utils.keccak256('bytes_key_owner_sender_test'), web3.utils.hexToBytes(web3.utils.toHex('Byte me!')), { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // test storage from only whitelist sender
    it('...storeBool fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            itemStorageInstance.storeBool(web3.utils.keccak256('bool_key_owner_sender_test'), false, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // test storage from only whitelist sender
    it('...storeInt256 fails if not from owner or allowedSender', async () => {
        await truffleAssert.fails(
            itemStorageInstance.storeInt256(web3.utils.keccak256('int256_key_owner_sender_test'), -99, { from: accounts[9] }),
            truffleAssert.ErrorType.REVERT
        )
    })

    // perform batch data writes with verifies
    it('...5x uint256 write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await itemStorageInstance.storeUint256(web3.utils.keccak256('uint256_key_' + i), i, { from: accounts[1] })
            let storedUint256 = await itemStorageInstance.uint256Storage(web3.utils.keccak256('uint256_key_' + i))
            assert.equal(storedUint256, i)
        }
    })

    // perform batch data writes with verifies
    it('...5x string write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await itemStorageInstance.storeString(web3.utils.keccak256('string_key_' + i), 'String Val ' + i, { from: accounts[1] })
            let storedString = await itemStorageInstance.stringStorage(web3.utils.keccak256('string_key_' + i))
            assert.equal(storedString, 'String Val ' + i)    
        }
    })

    // perform batch data writes with verifies
    it('...5x address write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await itemStorageInstance.storeAddress(web3.utils.keccak256('address_key_' + i), accounts[i], { from: accounts[1] })
            let storedAddress = await itemStorageInstance.addressStorage(web3.utils.keccak256('address_key_' + i))
            assert.equal(storedAddress, accounts[i])    
        }
    })

    // perform batch data writes with verifies
    it('...5x bytes write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            let stringVal = 'Byte me - ' + i
            let hexVal = web3.utils.toHex(stringVal)
            let bytesVal = web3.utils.hexToBytes(hexVal)

            await itemStorageInstance.storeBytes(web3.utils.keccak256('bytes_key_' + i), bytesVal, { from: accounts[1] })
            let storedBytes = await itemStorageInstance.bytesStorage(web3.utils.keccak256('bytes_key_' + i))
            assert.equal(web3.utils.hexToAscii(storedBytes), stringVal)    
        }
    })

    // perform batch data writes with verifies
    it('...5x bool write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await itemStorageInstance.storeBool(web3.utils.keccak256('bool_key_' + i), true, { from: accounts[1] })
            let storedBool = await itemStorageInstance.boolStorage(web3.utils.keccak256('bool_key_' + i))
            assert.equal(storedBool, true)    
        }
    })
    
    // perform batch data writes with verifies
    it('...5x ingt256 write/read verifies', async () => {
        for(let i = 0; i < 5; i++) {
            await itemStorageInstance.storeInt256(web3.utils.keccak256('int256_key_' + i), i - 1000, { from: accounts[1] })
            let storedInt256 = await itemStorageInstance.int256Storage(web3.utils.keccak256('int256_key_' + i))
            assert.equal(storedInt256, i - 1000)    
        }
    })
})