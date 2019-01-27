import {
  SAGA_GET_MY_LAFS
} from '../sagas/myLafsSaga.js'

import {
  SAGA_GET_LISTINGS
} from '../sagas/listingsSaga.js'

export const ITEM_EVENTS_RETRIEVED = 'listings/ITEM_EVENTS_RETRIEVED'

export const GET_MY_LAFS = "listings/GET_MY_LAFS"
export const MY_LAFS_RETRIEVED = "listings/MY_LAFS_RETRIEVED"
export const RETRIEVED_MY_CLAIMABLE_REWARDS = 'listings/RETRIEVED_MY_CLAIMABLE_REWARDS'
export const REWARDS_WITHDRAWN = 'listings/REWARDS_WITHDRAWN'

const initialState = {
  itemsStoredEvents: null,
  itemsStoredEventsRetrieved: false,
  eventRetrievalInProgress: false,
  item: null,
  itemMetadata: null,
  myLafItems: null,
  myClaimableRewards: null
}

export const getItemStoredEvents = (country, stateProvince) => {
  return async (dispatch, getState) => {
    const state = getState()

    dispatch({
      type: SAGA_GET_LISTINGS,
      app: state.app,
      country: country,
      stateProvince: stateProvince
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
    case SAGA_GET_LISTINGS:
      return {
        ...state,
        eventRetrievalInProgress: true
      }

    case ITEM_EVENTS_RETRIEVED:
      return {
        ...state,
        itemStoredEvents: action.itemStoredEvents,
        itemStoredEventsRetrieved: true,
        eventRetrievalInProgress: false
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