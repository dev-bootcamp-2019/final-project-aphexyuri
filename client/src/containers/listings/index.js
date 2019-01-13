import React, { Component } from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Container, Header, Form, Button, Icon } from 'semantic-ui-react'

import ListingItem from './listingItem.js'

import {
    getListingsPastEvents
} from '../../modules/listings'

class Listings extends Component {
    state = { selectedCountry: null, selectedStateProvince: null, stateProvinceOptions: null }

    // constructor(props) {
    //     super(props)
    // }

    componentDidMount () {
        if(this.props.listingsContract) {
            // console.log('Listings componentsDidMount')
            // this.props.getListingsPastEvents(this.props.web3, this.props.listingsContract)
        }
    }

    renderEntry = item => {
        return (
            // title
            <ListingItem
                web3={this.props.web3}
                key={item.id}
                item={item}/>
        )
    }

    handleCountrySelectionChange = (event, data) => {
        this.setState({ selectedCountry: data.value })

        for (let country of this.props.countries) {
            if(country.value == data.value) {
                this.setState({stateProvinceOptions: country.stateprovince})
                break
            }
        }
    }

    handleStateProvinceSelectionChange = (event, data) => {
        this.setState({ selectedStateProvince: data.value })
    }

    handleFindItemsClicked = () => {
        this.props.getListingsPastEvents(
            this.props.web3,
            this.props.listingsContract,
            this.state.selectedCountry,
            this.state.selectedStateProvince)
    }

    handleFindAllItemsClicked = () => {
        this.props.getListingsPastEvents(
            this.props.web3,
            this.props.listingsContract)
    }

    connectWhisper = () => {
        const defaultRecipientPubKey = "0x04ffb2647c10767095de83d45c7c0f780e483fb2221a1431cb97a5c61becd3c22938abfe83dd6706fc1154485b80bc8fcd94aea61bf19dd3206f37d55191b9a9c4";
        const defaultTopic = "0x5a4ea131";

        var Web3 = require('web3');
        // var web3 = new Web3('ws://localhost:8546');

        this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        this.shh = this.web3.shh;

        this.web3.eth.net.getId().then(function (id) {
            console.log('Whisper network id: ', id)
        })

        this.shh.getVersion((err, version) => {
            if (err) {
                return console.error(err.message)
            }
            else {
                console.log('shh version: ', version)
            }
        })

        let data = {
			msgs: [],
			text: "",
			symKeyId: null,
			name: "",
			asymKeyId: null,
			sympw: "",
			asym: true,
			configured: false,
			topic: defaultTopic,
			recipientPubKey: defaultRecipientPubKey,
			asymPubKey: ""
		};

        this.shh.newKeyPair().then(id => {
			data.asymKeyId = id;
			return this.shh.getPublicKey(id).then(pubKey => this.asymPubKey = pubKey).catch(console.log);
        }).catch(console.log);
        
        //====

        // var identities = [];
        // var subscription = null;

        // Promise.all([
        //     this.props.web3.shh.newSymKey().then((id) => {identities.push(id);}),
        //     this.props.web3.shh.newKeyPair().then((id) => {identities.push(id);})
        
        // ]).then(() => {        
        //     // will receive also its own message send, below
        //     subscription = this.props.web3.shh.subscribe("messages", {
        //         symKeyID: identities[0],
        //         topics: ['0xffaadd11']
        //     }).on('data', console.log);
        
        // }).then(() => {
        //     this.props.web3.shh.post({
        //         symKeyID: identities[0], // encrypts using the sym key ID
        //         sig: identities[1], // signs the message using the keyPair ID
        //         ttl: 10,
        //         topic: '0xffaadd11',
        //         payload: '0xffffffdddddd1122',
        //         powTime: 3,
        //         powTarget: 0.5
        //     }).then(h => console.log(`Message with hash ${h} was successfuly sent`))
        //     .catch(err => console.log("Error: ", err));
        // });
    }

    render () {
        return (
            <div>
                <Container>
                    <Header as='h3'>Search Lost & Found Items near you</Header>

                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Select fluid
                                label='Country'
                                options={this.props.countries}
                                placeholder='Country'
                                onChange={this.handleCountrySelectionChange} />
                            {
                                this.state.stateProvinceOptions ?
                                    <Form.Select fluid
                                        label='State/Province'
                                        options={this.state.stateProvinceOptions}
                                        placeholder='State/Province'
                                        onChange={this.handleStateProvinceSelectionChange} />
                                : null
                            }
                        </Form.Group>

                        <Button positive
                            size='large'
                            color='black'
                            onClick={this.handleFindItemsClicked}
                            disabled={!this.state.selectedCountry || !this.state.selectedStateProvince} >
                            <Icon name='search' />
                            Filter Items
                        </Button>

                        <Button basic
                            size='large'
                            color='black'
                            onClick={this.handleFindAllItemsClicked} >
                            Find All
                        </Button>

                        <Button basic
                            size='large'
                            color='red'
                            onClick={this.connectWhisper} >
                            Connect to Whisper
                        </Button>
                    </Form>
                    {
                        this.props.listings ?
                            this.props.listings.map(this.renderEntry)
                        : null
                    }
                </Container>
            </div>
        )
      }
}

const mapStateToProps = state => ({
    countries: state.listings.countries,
    listings: state.listings.listings,
    listingsRetrieved: state.listings.listingsRetrieved,
    countries: state.listings.countries
  })

const mapDispatchToProps = dispatch => bindActionCreators({
    getListingsPastEvents
  }, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(Listings)
