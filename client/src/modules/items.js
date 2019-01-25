export const GOT_ADD_ITEM_TX_HASH = 'items/GOT_ADD_ITEM_TX_HASH'
export const CLEAR_ADD_ITEM_TX_HASH = 'items/CLEAR_ADD_ITEM_TX_HASH'
export const ADD_ITEM_TX_COMPLETE = 'items/ADD_ITEM_TX_COMPLETE'

export const ITEM_RETRIEVED = 'items/ITEM_RETRIEVED'
export const ITEM_METADATA_RETRIEVED = 'items/ITEM_METADATA_RETRIEVED'
export const CLEAR_ITEM = 'items/CLEAR_ITEM'

export const ITEM_CANCEL_REQUESTED = 'listings/ITEM_CANCEL_REQUESTED'
export const ITEM_FOUND_REQUESTED = 'listings/ITEM_FOUND_REQUESTED'
export const MATCH_CONFIRMED_REQUESTED = 'listings/MATCH_CONFIRMED_REQUESTED'
export const MATCH_INVALID_REQUESTED = 'listings/MATCH_INVALID_REQUESTED'
export const ITEM_RECOVERED_REQUESTED = 'listings/ITEM_RECOVERED_REQUESTED'
export const ITEM_RECOVERY_FAILED_REQUESTED = 'listings/ITEM_RECOVERY_FAILED_REQUESTED'

const initialState = {
  addItemOppInProgress: false,
  addItemTxHash: null,
  addItemTxResult: null,
  item: null,
  itemMetadata: null
}

export const addItem = (title, details, country, stateProvice, city, ipfsDigest, ipfsHashFunction, ipfsSize, reward) => {
  return async (dispatch, getState) => {
    const state = getState()

    let titleHex = title
    let countryHex = state.app.web3.utils.asciiToHex(country)
    let stateProvinceHex = state.app.web3.utils.asciiToHex(stateProvice)
    let cityHex = state.app.web3.utils.asciiToHex(city)

    state.app.registryContract.methods.newLostItem(
      titleHex,
      details,
      countryHex,
      stateProvinceHex,
      cityHex,
      ipfsDigest,
      ipfsHashFunction,
      ipfsSize
    ).send({ from: state.app.accounts[0], value: state.app.web3.utils.toWei(reward)})
    .on('transactionHash', (hash) => {
      // console.log('transactionHash', hash)
      dispatch({
        type: GOT_ADD_ITEM_TX_HASH,
        txHash: hash
      })
    })
    .then((result) => {
      // console.log('result', result)
      dispatch({
        type: ADD_ITEM_TX_COMPLETE,
        txResult: result
      })
    })
  }
}

export const clearAddItemTxtHash = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: CLEAR_ADD_ITEM_TX_HASH
    })
  }
}

export const getItem = (itemId) => {
  return async (dispatch, getState) => {
    const state = getState()

    state.app.registryContract.methods.getItem(itemId).call()
    .then(function(item) {
      dispatch({
        type: ITEM_RETRIEVED,
        item: item
      })
    })
  }
}

export const getItemMetadata = (itemId) => {
  return async (dispatch, getState) => {
    const state = getState()

    state.app.registryContract.methods.getItemMetadata(itemId).call()
    .then(function(itemMetadata) {
      dispatch({
        type: ITEM_METADATA_RETRIEVED,
        itemMetadata: itemMetadata
      })
    })
  }
}

export const clearItem = (itemId) => {
  return function action(dispatch, getState) {
    dispatch({ type: CLEAR_ITEM })
  }
}

export const cancelItem = (itemId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.cancelItem(itemId).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('cancelItem', result)
      dispatch({
        type: ITEM_CANCEL_REQUESTED,
        itemId: itemId
      })
    })
  }
}

export const foundLostItem = (itemId, details, ipfsDigest, ipfsHashFunction, ipfsSize) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.foundLostItem(
      itemId,
      details,
      ipfsDigest,
      ipfsHashFunction,
      ipfsSize).send({ from: state.app.accounts[0], value: 0 })
    .then(function(result) {
      // console.log('foundLostItem', result)
      dispatch({
        type: ITEM_FOUND_REQUESTED,
        itemId: itemId
      })
    })
  }
}

export const matchConfirmed = (itemId, excahngeDetails) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.matchConfirmed(itemId, excahngeDetails).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('matchConfirmed', result)
      dispatch({
        type: MATCH_CONFIRMED_REQUESTED,
        itemId: itemId
      })
    })
  }
}

export const matchInvalid = (itemId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.matchInvalid(itemId).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('matchInvalid', result)
      dispatch({
        type: MATCH_INVALID_REQUESTED,
        itemId: itemId
      })
    })
  }
}

export const itemRecovered = (itemId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.itemRecovered(itemId).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('itemRecovered', result)
      dispatch({
        type: ITEM_RECOVERED_REQUESTED,
        itemId: itemId
      })
    })
  }
}

export const itemRecoveryFailed = (itemId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.itemRecoveryFailed(itemId).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('itemRecoveryFailed', result)
      dispatch({
        type: ITEM_RECOVERY_FAILED_REQUESTED,
        itemId: itemId
      })
    })
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GOT_ADD_ITEM_TX_HASH:
      return {
        ...state,
        addItemTxHash: action.txHash
      }
    
    case CLEAR_ADD_ITEM_TX_HASH:
      return {
        ...state,
        addItemTxHash: null
      }
    
    case ADD_ITEM_TX_COMPLETE:
      return {
        ...state,
        addItemTxResult: action.txResult
      }
    
    case ITEM_RETRIEVED:
      return {
        ...state,
        item: action.item
      }

    case ITEM_METADATA_RETRIEVED:
      return {
        ...state,
        itemMetadata: action.itemMetadata
      }

    case CLEAR_ITEM:
      return {
        ...state,
        item: null,
        itemMetadata: null
      }
    
      case ITEM_CANCEL_REQUESTED:
      return {
        ...state
      }

    case ITEM_FOUND_REQUESTED:
      console.log('ITEM_FOUND_REQUESTED reducer')
      return {
        ...state
      }

    case MATCH_CONFIRMED_REQUESTED:
      return {
        ...state
      }

    case MATCH_INVALID_REQUESTED:
      return {
        ...state
      }

    case ITEM_RECOVERED_REQUESTED:
      return {
        ...state
      }

    case ITEM_RECOVERY_FAILED_REQUESTED:
      return {
        ...state
      }

    default:
      return state
  }
}