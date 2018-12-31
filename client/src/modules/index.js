import { combineReducers } from 'redux'
import counter from './counter'
import listings from './listings'

export default combineReducers({
  counter,
  listings
})
