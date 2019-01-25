import {
  SAGA_GET_MY_LAFS
} from '../sagas/myLafsSaga.js'

export const ASSETS_STORED_EVENTS_RETRIEVED = 'listings/ASSETS_STORED_EVENTS_RETRIEVED'
export const ASSET_RETRIEVED = 'listing/ASSET_RETRIEVED'
export const ASSET_METADATA_RETRIEVED = 'listing/ASSET_METADATA_RETRIEVED'
export const CLEAR_ASSET = 'listing/CLEAR_ASSET'

export const CANCEL_ASSET_REQUESTED = 'listings/CANCEL_ASSET_REQUESTED'
export const FOUND_LOST_ASSET_REQUESTED = 'listings/FOUND_LOST_ASSET_REQUESTED'
export const MATCH_CONFIRMED_REQUESTED = 'listings/MATCH_CONFIRMED_REQUESTED'
export const MATCH_INVALID_REQUESTED = 'listings/MATCH_INVALID_REQUESTED'
export const ASSET_RECOVERED_REQUESTED = 'listings/ASSET_RECOVERED_REQUESTED'
export const ASSET_RECOVERY_FAILED_REQUESTED = 'listings/ASSET_RECOVERY_FAILED_REQUESTED'
export const GET_MY_LAFS = "listings/GET_MY_LAFS"
export const MY_LAFS_RETRIEVED = "listings/MY_LAFS_RETRIEVED"
export const RETRIEVED_MY_CLAIMABLE_REWARDS = 'listings/RETRIEVED_MY_CLAIMABLE_REWARDS'
export const REWARDS_WITHDRAWN = 'listings/REWARDS_WITHDRAWN'

const initialState = {
  itemsStoredEvents: null,
  itemsStoredEventsRetrieved: false,
  item: null,
  itemMetadata: null,
  myLafItems: null,
  myClaimableRewards: null
}

export const getItemStoredEvents = (country, stateProvince, initialItemType) => {
  return function action(dispatch, getState) {
    const state = getState()
    // console.log('getItemStoredEvents.actoion - state', state)

    var getEventsOptions = {
      fromBlock: 0, //TODO should this be narrowed down?
      toBlock: 'latest'
    }
  
    if(country || stateProvince) {
      var filter = {}
  
      if(country) {
        var hexCountry = state.app.web3.utils.padRight(state.app.web3.utils.asciiToHex(country), 16)
        // console.log('hexCountry', hexCountry)
        filter.isoCountryCode = hexCountry
      }
  
      if(stateProvince) {
        var hexStateProvice = state.app.web3.utils.padRight(state.app.web3.utils.asciiToHex(stateProvince), 16)
        // console.log('hexStateProvice', hexStateProvice)
        filter.stateProvince = hexStateProvice
      }
  
      getEventsOptions.filter = filter
    }

    // TODO retrieve cancelled and retrieved event & remove from ItemStored
    state.app.registryContract.getPastEvents('ItemStored', getEventsOptions)
    .then(function(itemStoredEvents){
      // console.log('retrieved past events', itemsStoredEvents)
      dispatch({
        type: ASSETS_STORED_EVENTS_RETRIEVED,
        itemStoredEvents: itemStoredEvents
      })
    })
  }
}

export const getItem = (itemId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.getItem(itemId).call()
    .then(function(item) {
      dispatch({
        type: ASSET_RETRIEVED,
        item: item
      })
    })
  }
}

export const getItemMetadata = (itemId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.getItemMetadata(itemId).call()
    .then(function(itemMetadata) {
      dispatch({
        type: ASSET_METADATA_RETRIEVED,
        itemMetadata: itemMetadata
      })
    })
  }
}

export const clearItem = (itemId) => {
  return function action(dispatch, getState) {
    dispatch({ type: CLEAR_ASSET })
  }
}

export const cancelItem = (itemId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.cancelItem(itemId).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('cancelItem', result)
      dispatch({
        type: CANCEL_ASSET_REQUESTED,
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
        type: FOUND_LOST_ASSET_REQUESTED,
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
        type: ASSET_RECOVERED_REQUESTED,
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
        type: ASSET_RECOVERY_FAILED_REQUESTED,
        itemId: itemId
      })
    })
  }
}

export const getMyLAFs = () => {
  return async (dispatch, getState) => {
    const state = getState()

    dispatch({
      type: SAGA_GET_MY_LAFS,
      app: state.app
    })
  }
}

export const getClaimableRewards = () => {
  return async (dispatch, getState) => {
    const state = getState()

    state.app.registryContract.methods.getClaimableRewards().call({ from: state.app.accounts[0] })
    .then(function(result) {
      dispatch({
        type: RETRIEVED_MY_CLAIMABLE_REWARDS,
        myClaimableRewards: result
      })
    })
  }
}

export const withdrawRewards = () => {
  return async (dispatch, getState) => {
    const state = getState()

    state.app.registryContract.methods.withdrawRewards().send({ from: state.app.accounts[0] })
    .then(function(result) {
      dispatch({
        type: REWARDS_WITHDRAWN
      })
    })
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case ASSETS_STORED_EVENTS_RETRIEVED:
      return {
        ...state,
        itemStoredEvents: action.itemStoredEvents,
        itemStoredEventsRetrieved: true
      }
    
    case ASSET_RETRIEVED:
      return {
        ...state,
        item: action.item
      }

    case ASSET_METADATA_RETRIEVED:
      return {
        ...state,
        itemMetadata: action.itemMetadata
      }

    case CLEAR_ASSET:
      // console.log('CLEAR_ASSET')
      return {
        ...state,
        item: null,
        itemMetadata: null
      }
    
    case CANCEL_ASSET_REQUESTED:
      return {
        ...state
      }

    case FOUND_LOST_ASSET_REQUESTED:
      console.log('FOUND_LOST_ASSET_REQUESTED reducer')
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

    case ASSET_RECOVERED_REQUESTED:
      return {
        ...state
      }

    case ASSET_RECOVERY_FAILED_REQUESTED:
      return {
        ...state
      }

    case GET_MY_LAFS:
      return {
        ...state
      }

    case MY_LAFS_RETRIEVED:
      // console.log(action.myLafItems)
      return {
        ...state,
        myLafItems: action.myLafItems
      }

    case RETRIEVED_MY_CLAIMABLE_REWARDS:
      return {
        ...state,
        myClaimableRewards: action.myClaimableRewards
      }
    
    case REWARDS_WITHDRAWN:
      return {
        ...state,
        myClaimableRewards: null
      }

    default:
      return state
  }
}