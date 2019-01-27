import { call, put, takeEvery } from 'redux-saga/effects'

import {
  ITEM_EVENTS_RETRIEVED,
} from '../modules/listings.js'

export const SAGA_GET_LISTINGS = 'saga/SAGA_GET_LISTINGS'

export function getItemStoredEvents(app, getEventsOptions) {
  return new Promise((resolve) => {
    app.registryContract.getPastEvents('ItemStored', getEventsOptions)
    .then((result) => {
      resolve(result)
    })
  })
}

export function getFoundLostItemEvents(app, getEventsOptions) {
  return new Promise((resolve) => {
    app.registryContract.getPastEvents('FoundLostItem', getEventsOptions)
    .then((result) => {
      resolve(result)
    })
  })
}

export function getMatchConfirmedEvents(app, getEventsOptions) {
  return new Promise((resolve) => {
    app.registryContract.getPastEvents('MatchConfirmed', getEventsOptions)
    .then((result) => {
      resolve(result)
    })
  })
}

export function getItemCancelledEvents(app, getEventsOptions) {
  return new Promise((resolve) => {
    app.registryContract.getPastEvents('ItemCancelled', getEventsOptions)
    .then((result) => {
      resolve(result)
    })
  })
}

export function getItemRecoveredEvents(app, getEventsOptions) {
  return new Promise((resolve) => {
    app.registryContract.getPastEvents('ItemRecovered', getEventsOptions)
    .then((result) => {
      resolve(result)
    })
  })
}

function* getListings(action) {
  var getEventsOptions = {
    fromBlock: 0, //TODO should this be narrowed down?
    toBlock: 'latest'
  }

  if(action.country || action.stateProvince) {
    var filter = {}

    if(action.country) {
      var hexCountry = action.app.web3.utils.padRight(action.app.web3.utils.asciiToHex(action.country), 16)
      // console.log('hexCountry', hexCountry)
      filter.isoCountryCode = hexCountry
    }

    if(action.stateProvince) {
      var hexStateProvice = action.app.web3.utils.padRight(action.app.web3.utils.asciiToHex(action.stateProvince), 16)
      // console.log('hexStateProvice', hexStateProvice)
      filter.stateProvince = hexStateProvice
    }

    getEventsOptions.filter = filter
  }

  const itemStoredEvents = yield call(getItemStoredEvents, action.app, getEventsOptions)
  // console.log('itemStoredEvents', itemStoredEvents)

  const itemCancelledEvents = yield call(getItemCancelledEvents, action.app, getEventsOptions)
  // console.log('itemCancelledEvents', itemCancelledEvents)

  const itemRecoveredEvents = yield call(getItemRecoveredEvents, action.app, getEventsOptions)
  // console.log('itemRecoveredEvents', itemRecoveredEvents)

  const foundLostItemEvents = yield call(getFoundLostItemEvents, action.app, getEventsOptions)
  // console.log('foundLostItemEvents', foundLostItemEvents)

  const matchConfirmedEvents = yield call(getMatchConfirmedEvents, action.app, getEventsOptions)
  // console.log('matchConfirmedEvents', matchConfirmedEvents)
  
  for (let i = itemStoredEvents.length - 1; i >= 0; --i) {
    itemStoredEvents[i].returnValues.itemStatus = 1
    
    let removedByCancelled = false

    // removed cancelled events
    for (let j = 0; j < itemCancelledEvents.length; j++) {
      if(parseInt(itemCancelledEvents[j].returnValues.itemId) === parseInt(itemStoredEvents[i].returnValues.itemId)) {
        itemStoredEvents.splice(i, 1)
        removedByCancelled = true
        break
      }
    }

    if(!removedByCancelled) {
      for(let k = 0; k < foundLostItemEvents.length; k++) {
        if(parseInt(foundLostItemEvents[k].returnValues.itemId) === parseInt(itemStoredEvents[i].returnValues.itemId)) {
          itemStoredEvents[i].returnValues.itemStatus = 2
        }
      }

      for(let l = 0; l < matchConfirmedEvents.length; l++) {
        if(parseInt(matchConfirmedEvents[l].returnValues.itemId) === parseInt(itemStoredEvents[i].returnValues.itemId)) {
          itemStoredEvents[i].returnValues.itemStatus = 3
        }
      }

      for(let m = 0; m < itemRecoveredEvents.length; m++) {
        if(parseInt(itemRecoveredEvents[m].returnValues.itemId) === parseInt(itemStoredEvents[i].returnValues.itemId)) {
          itemStoredEvents[i].returnValues.itemStatus = 4
        }
      }
    }
  }

  yield put({ type: ITEM_EVENTS_RETRIEVED, itemStoredEvents: itemStoredEvents})
}

function* listingSaga() {
  yield takeEvery(SAGA_GET_LISTINGS, getListings);
}

export default listingSaga;