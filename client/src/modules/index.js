import { combineReducers } from 'redux'
import app from './app'
import counter from './counter'
import listings from './listings'

export default combineReducers({
  app,
  counter,
  listings
})
