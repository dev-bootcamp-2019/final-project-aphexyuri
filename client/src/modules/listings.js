export const ASSETS_STORED_EVENTS_RETRIEVED = 'listings/ASSETS_STORED_EVENTS_RETRIEVED'

const initialState = {
  assetsStoredEvents: null,
  assetsStoredEventsRetrieved: false
  }

export const getAssetStoredEvents = (web3, listingsContract, country, stateProvince, initialAssetType) => {
  // console.log('listings.getAssetStoredEvents for', country + ' ' + stateProvince);

  var getEventsOptions = {
    fromBlock: 0, //TODO should this be narrowed down?
    toBlock: 'latest'
  }

  if(country || stateProvince) {
    var filter = {}

    if(country) {
      var hexCountry = web3.utils.padRight(web3.utils.asciiToHex(country), 16)
      // console.log('hexCountry', hexCountry)
      filter.isoCountryCode = hexCountry
    }

    if(stateProvince) {
      var hexStateProvice = web3.utils.padRight(web3.utils.asciiToHex(stateProvince), 16)
      // console.log('hexStateProvice', hexStateProvice)
      filter.stateProvince = hexStateProvice
    }

    getEventsOptions.filter = filter
  }

  console.log('getPastEventsOptions', getEventsOptions)

  return function action(dispatch) {
    listingsContract.getPastEvents('AssetStored', getEventsOptions)
    .then(function(assetStoredEvents){
      // console.log('retrieved past events', assetsStoredEvents)
      dispatch({
        type: ASSETS_STORED_EVENTS_RETRIEVED,
        assetStoredEvents: assetStoredEvents
      })
    })
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case ASSETS_STORED_EVENTS_RETRIEVED:
      console.log(action)
      return {
        ...state,
        assetStoredEvents: action.assetStoredEvents,
        assetStoredEventsRetrieved: true
      }

    default:
      return state
  }
}