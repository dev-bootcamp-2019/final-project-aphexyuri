import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import getWeb3 from "../../utils/getWeb3";

import Home from '../home'
import Listings from '../listings'
import AddItem from '../additem'

import LAFContract from "../../contracts/LAF.json";

import {
    getListingsPastEvents
} from '../../modules/listings'

class App extends Component {
    state = { web3: null, listingsContract: null, accounts: null, entries: null }

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3()

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const networkId = await web3.eth.net.getId()
            const deployedNetwork = LAFContract.networks[networkId]
            const listingsContract = new web3.eth.Contract(
                LAFContract.abi,
                deployedNetwork && deployedNetwork.address,
            )

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            this.setState({ web3, accounts, listingsContract: listingsContract }) //, this.runExample);

            // console.log('Retrieved contract instance')
        }
        catch(error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            )
            console.error(error);
        }
    }

    // runExample = async () => {
        // const { web3, listingsContract } = this.state

        // this.props.getListingsPastEvents(web3, listingsContract)

    //     var that = this

    //     listingsContract.getPastEvents('ItemStored', {
    //         fromBlock: 0,
    //         toBlock: 'latest'
    //     }, function(error, entries) {
    //         console.log('callback', entries)

    //         that.setState({
    //             entries: entries
    //         })
    //     })
    //     .then(function(events){
    //         console.log('then', events) // same results as the optional callback above
    //     });
    // }

    render() {
        return (
            <div>
                <header>
                    {/* <Link to="/">Home</Link> */}
                    <Link to="/listings">Listings</Link>
                    <Link to="/additem">Add Item</Link>
                </header>

                <main>
                    {/* <Route exact path="/" component={Home} /> */}
                    <Route exact path="/listings"
                        render={ (props) =>
                            <Listings
                                {...props}
                                web3={this.state.web3}
                                listingsContract={this.state.listingsContract}
                                accounts={this.state.accounts}
                                entries={this.state.entries}
                            />
                        }
                    />
                    {/* <Route exact path="/additem" component={AddItem} /> */}
                    <Route exact path="/additem"
                        render={ (props) =>
                            <AddItem
                                {...props}
                                listingsContract={this.state.listingsContract}
                                accounts={this.state.accounts}
                            />
                        }
                    />
                </main>
            </div>
        )
    }
}
  
  export default App
