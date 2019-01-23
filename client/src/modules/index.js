import { combineReducers } from 'redux'
import app from './app'
import listings from './listings'

export default combineReducers({
  app,
  listings
})
