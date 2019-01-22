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
  assetsStoredEvents: null,
  assetsStoredEventsRetrieved: false,
  asset: null,
  assetMetadata: null,
  myLafAssets: null,
  myClaimableRewards: null
}

export const getAssetStoredEvents = (country, stateProvince, initialAssetType) => {
  return function action(dispatch, getState) {
    const state = getState()
    // console.log('getAssetStoredEvents.actoion - state', state)

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

    // TODO retrieve cancelled and retrieved event & remove from AssetStored
    state.app.registryContract.getPastEvents('AssetStored', getEventsOptions)
    .then(function(assetStoredEvents){
      // console.log('retrieved past events', assetsStoredEvents)
      dispatch({
        type: ASSETS_STORED_EVENTS_RETRIEVED,
        assetStoredEvents: assetStoredEvents
      })
    })
  }
}

export const getAsset = (assetId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.getAsset(assetId).call()
    .then(function(asset) {
      dispatch({
        type: ASSET_RETRIEVED,
        asset: asset
      })
    })
  }
}

export const getAssetMetadata = (assetId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.getAssetMetadata(assetId).call()
    .then(function(assetMetadata) {
      dispatch({
        type: ASSET_METADATA_RETRIEVED,
        assetMetadata: assetMetadata
      })
    })
  }
}

export const clearAsset = (assetId) => {
  return function action(dispatch, getState) {
    dispatch({ type: CLEAR_ASSET })
  }
}

export const cancelAsset = (assetId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.cancelAsset(assetId).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('cancelAsset', result)
      dispatch({
        type: CANCEL_ASSET_REQUESTED,
        assetId: assetId
      })
    })
  }
}

export const foundLostAsset = (assetId, details, ipfsDigest, ipfsHashFunction, ipfsSize) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.foundLostAsset(
      assetId,
      details,
      ipfsDigest,
      ipfsHashFunction,
      ipfsSize).send({ from: state.app.accounts[0], value: 0 })
    .then(function(result) {
      // console.log('foundLostAsset', result)
      dispatch({
        type: FOUND_LOST_ASSET_REQUESTED,
        assetId: assetId
      })
    })
  }
}

export const matchConfirmed = (assetId, excahngeDetails) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.matchConfirmed(assetId, excahngeDetails).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('matchConfirmed', result)
      dispatch({
        type: MATCH_CONFIRMED_REQUESTED,
        assetId: assetId
      })
    })
  }
}

export const matchInvalid = (assetId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.matchInvalid(assetId).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('matchInvalid', result)
      dispatch({
        type: MATCH_INVALID_REQUESTED,
        assetId: assetId
      })
    })
  }
}

export const assetRecovered = (assetId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.assetRecovered(assetId).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('assetRecovered', result)
      dispatch({
        type: ASSET_RECOVERED_REQUESTED,
        assetId: assetId
      })
    })
  }
}

export const assetRecoveryFailed = (assetId) => {
  return function action(dispatch, getState) {
    const state = getState()

    state.app.registryContract.methods.assetRecoveryFailed(assetId).send({ from: state.app.accounts[0] })
    .then(function(result) {
      console.log('assetRecoveryFailed', result)
      dispatch({
        type: ASSET_RECOVERY_FAILED_REQUESTED,
        assetId: assetId
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
        assetStoredEvents: action.assetStoredEvents,
        assetStoredEventsRetrieved: true
      }
    
    case ASSET_RETRIEVED:
      return {
        ...state,
        asset: action.asset
      }

    case ASSET_METADATA_RETRIEVED:
      return {
        ...state,
        assetMetadata: action.assetMetadata
      }

    case CLEAR_ASSET:
      // console.log('CLEAR_ASSET')
      return {
        ...state,
        asset: null,
        assetMetadata: null
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
      // console.log(action.myLafAssets)
      return {
        ...state,
        myLafAssets: action.myLafAssets
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