export const ADD_ITEM_TX_REQUESTED = 'items/ADD_ITEM_TX_REQUESTED'

const initialState = {}

export const addItem = (title, details, country, stateProvice, city, ipfsDigest, ipfsHashFunction, ipfsSize, reward) => {
  return async (dispatch, getState) => {
    const state = getState()

    let titleHex = title
    let countryHex = this.props.app.web3.utils.asciiToHex(country)
    let stateProvinceHex = this.props.app.web3.utils.asciiToHex(stateProvice)
    let cityHex = this.props.app.web3.utils.asciiToHex(city)

    await state.app.registryContract.methods.newLostItem(
      titleHex,
      details,
      countryHex,
      stateProvinceHex,
      cityHex,
      ipfsDigest,
      ipfsHashFunction,
      ipfsSize
    ).send({
      from: state.app.accounts[0],
      value: state.app.web3.utils.toWei(reward)
    });
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_ITEM_TX_REQUESTED:
      return {
        ...state
      }

    default:
      return state
  }
}