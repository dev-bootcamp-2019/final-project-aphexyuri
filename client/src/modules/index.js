import { combineReducers } from 'redux'
import app from './app'
import listings from './listings'
import items from './items'

export default combineReducers({
  app,
  listings,
  items
})
