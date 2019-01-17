export const ASSETS_STORED_EVENTS_RETRIEVED = 'listings/ASSETS_STORED_EVENTS_RETRIEVED'
export const ASSET_RETRIEVED = 'listing/ASSET_RETRIEVED'
export const CLEAR_ASSET = 'listing/CLEAR_ASSET'

const initialState = {
  assetsStoredEvents: null,
  assetsStoredEventsRetrieved: false,
  asset: null
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

export const clearAsset = (assetId) => {
  return function action(dispatch, getState) {
    dispatch({ type: CLEAR_ASSET })
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

    case CLEAR_ASSET:
      console.log('CLEAR_ASSET')
      return {
        ...state,
        asset: null
      }

    default:
      return state
  }
}