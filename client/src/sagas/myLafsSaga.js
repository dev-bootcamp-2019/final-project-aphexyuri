import { call, put, takeEvery } from 'redux-saga/effects'

import {
  MY_LAFS_RETRIEVED,
} from '../modules/listings.js'

export const SAGA_GET_MY_LAFS = 'saga/SAGA_GET_MY_ENTRIES'

export function getIndicies(app) {
  return new Promise((resolve) => {
    app.registryContract.methods.getMyLAFIndicies().call()
    .then((result) => {
      resolve(
        result
      )
    })
  });
}

export function getAsset(app, assetId) {
  return new Promise((resolve) => {
    app.registryContract.methods.getAsset(assetId).call()
    .then((result) => {
      resolve(
        result
      )
    })
  })
}

function* getMyLAFIndicies(action) {
  // console.log('getMyLAFIndicies', action.app)

  const indicies = yield call(getIndicies, action.app);
  // console.log('indicies', indicies)

  let assets = []

  for(let i = 0; i < indicies.length; i++) {
    // console.log('indicies[' + i + ']', indicies[i])
    let asset = yield call (getAsset, action.app, indicies[i])
    asset.assetId = indicies[i]
    // console.log(asset)
    assets.push(asset)
  }

  yield put({type: MY_LAFS_RETRIEVED, myLafAssets: assets});
}

function* myEntriesSaga() {
  yield takeEvery(SAGA_GET_MY_LAFS, getMyLAFIndicies);
}

export default myEntriesSaga;