import { call, put, takeEvery } from 'redux-saga/effects'

import {
  MY_LAFS_RETRIEVED,
} from '../modules/listings.js'

export const SAGA_GET_MY_LAFS = 'saga/SAGA_GET_MY_ENTRIES'

export function getIndicies(app) {
  return new Promise((resolve) => {
    app.registryContract.methods.getMyLAFIndicies().call({ from: app.accounts[0] })
    .then((result) => {
      resolve(result)
    })
  });
}

export function getItem(app, itemId) {
  return new Promise((resolve) => {
    app.registryContract.methods.getItem(itemId).call({ from: app.accounts[0] })
    .then((result) => {
      // console.log('myLafsSaga.getItem result: ', result)
      resolve(result)
    })
  })
}

function* getMyLAFIndicies(action) {
  // console.log('myLafsSaga.getMyLAFIndicies', action.app)

  const indicies = yield call(getIndicies, action.app);
  // console.log('myLafsSaga.getMyLAFIndicies - indicies:', indicies)

  let items = []

  for(let i = 0; i < indicies.length; i++) {
    // console.log('indicies[' + i + ']', indicies[i])
    let item = yield call (getItem, action.app, indicies[i])
    item.itemId = indicies[i]
    // console.log(item)
    items.push(item)
  }

  yield put({type: MY_LAFS_RETRIEVED, myLafItems: items});
}

function* myEntriesSaga() {
  yield takeEvery(SAGA_GET_MY_LAFS, getMyLAFIndicies);
}

export default myEntriesSaga;