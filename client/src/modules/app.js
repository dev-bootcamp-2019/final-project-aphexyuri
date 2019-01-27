import LAFRegistryContract from "../contracts/LAFItemRegistry.json";
import LAFItemStorageContract from "../contracts/LAFItemStorage.json";

import getWeb3 from "../utils/getWeb3";

export const INIT_COMPLETE = 'app/INIT_COMPLETE'

const initialState = {
  web3: null,
  registryContract: null,
  storageContract: null
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
          const registryDeployedNetwork = LAFRegistryContract.networks[networkId]
          
          const registryContract = new web3.eth.Contract(
            LAFRegistryContract.abi,
            registryDeployedNetwork && registryDeployedNetwork.address,
          )

          const storageDeployedNetwork = LAFItemStorageContract.networks[networkId]

          const storageContract = new web3.eth.Contract(
            LAFItemStorageContract.abi,
            storageDeployedNetwork && storageDeployedNetwork.address,
          )

          dispatch({  
            type: INIT_COMPLETE,
            web3: web3,
            accounts: accounts,
            registryContract: registryContract,
            storageContract: storageContract
          })
        })
        .catch((error) => {
          console.log('networkId error:', error)
        })
      })
      .catch((error) => {
        console.log('get accounts error:', error)
      })
    })
    .catch((error) => {
      console.log('web3 error:', error)
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
        registryContract: action.registryContract,
        storageContract: action.storageContract
      }

    default:
      return state
  }
}

