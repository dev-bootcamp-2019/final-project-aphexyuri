import {
  SAGA_GET_MY_LAFS
} from '../sagas/myLafsSaga.js'

export const ASSETS_STORED_EVENTS_RETRIEVED = 'listings/ASSETS_STORED_EVENTS_RETRIEVED'

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