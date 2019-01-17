import LAFRegistryContract from "../contracts/LAFAssetRegistry.json";

import getWeb3 from "../utils/getWeb3";

export const INIT_COMPLETE = 'app/INIT_COMPLETE'

const initialState = {
  web3: null,
  registryContract: null
}

export const initWeb3 = () => {
  // console.log('app.initWeb3')
  return function action(dispatch) {
    getWeb3()
    .then(function(web3) {
      web3.eth.getAccounts()
      .then(function(accounts) {
        web3.eth.net.getId()
        .then(function(networkId){
          const deployedNetwork = LAFRegistryContract.networks[networkId]
          const registryContract = new web3.eth.Contract(
            LAFRegistryContract.abi,
            deployedNetwork && deployedNetwork.address,
          )

          dispatch({  
            type: INIT_COMPLETE,
            web3: web3,
            accounts: accounts,
            registryContract: registryContract
          })
        })
      })
    })
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case INIT_COMPLETE:
      console.log('INIT_COMPLETE', action)
      return {
        ...state,
        web3: action.web3,
        accounts: action.accounts,
        registryContract: action.registryContract
      }

    default:
      return state
  }
}

